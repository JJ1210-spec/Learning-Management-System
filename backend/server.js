const express = require('express');
const mysql = require('mysql2/promise');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const app = express();

app.use(cors());
app.use(express.json());

const jwt_secret = '4d180feeef9998c0222c8562b267127a';

const pool = mysql.createPool({
    host:'localhost',
    user:'root',
    password: 'India@2005',
    database:'lms_database',
    waitForConnections: true,
    connectionLimit:10, //10 sql connections created at a time
    queueLimit:0 //no queue limit
});

pool.getConnection()
.then(
    conn =>{
        console.log('MySQL connected');
        conn.release();
    }
)
.catch(
    err =>{
        console.log('MySQL Error:',err.message);
    }
)

const authMiddleware = async(req,res,next)=>{
    const token = req.header('Authorization')?.replace('Bearer ','');

    if(!token){
        return res.status(401).json({error:'No token , authorization denied'});
    }

    try{
        const decoded = jwt.verify(token,jwt_secret);
        req.userId = decoded.userId;
        next();
    }
    catch(err){
        res.status(401).json({error:'Token is not valid'});
    }
};

app.post('/api/auth/register',async(req,res)=>{
    try{
        const {name,email,password} = req.body;

        const [users] = await pool.query('Select * from users where email=?',[email]);
        if(users.length > 0){
            return res.status(400).json({error:'User already exists'});
        }

        const hashedPassword = await bcrypt.hash(password,10);

        const[result] = await pool.query(
            'Insert into users(user_name, email, user_password) values (?,?,?)',
            [name,email,hashedPassword]
        );

        const userId = result.insertId;

        const token = jwt.sign({userId},jwt_secret);

        res.json({
            token,
            user:{id:userId,name,email}
        });

    
    } catch(err){
        res.status(500).json({error:err.message});
    }
});


app.post('/api/auth/login',async(req,res)=>{
    try{
        const {email , password} = req.body;

        const[users] = await pool.query('select * from users where email =?',[email]);
        if(users.length===0){
            return res.status(400).json({error:'Invalid credentials'});
        }

        const user= users[0]

        const isMatch = await bcrypt.compare(password,user.user_password);
        if(!isMatch){
            return res.status(400).json({error:'Invalid credentials'});
        }

        const token = jwt.sign({userId:user.id},jwt_secret);

        res.json({
            token,
            user:{
                id:user.id,
                name: user.user_name,
                email:user.email
            }
        });
    }
    catch(err){
        res.status(500).json({error:err.message});
    }
});

app.get('/api/auth/me',authMiddleware,async(req,res)=>{
    try{
        const [users] = await pool.query('Select id , user_name, email,created_at from users where id= ?',[req.userId]);
        if(users.length===0){
            return res.status(404).json({error:'user not found'});
        }

        const user = users[0];
        res.json({
            id: user.id,
            name: user.user_name,
            email: user.email,
            created_at: user.created_at
        });
    }

    catch(err){
        res.status(500).json({error:err.message});
    }
});


app.get('/api/courses',async (req,res)=>{
    try{
        const [courses] = await pool.query
        (`
            Select c.* , count(l.id) as lesson_count from courses c 
            left join lessons l on c.id = l.course_id
            group by c.id
        `)
            res.json(courses);
    }
    catch(err){
        res.status(500).json({error:err.message});
    }
});

app.get('/api/courses/:id',async (req,res)=>{
    try{
        const [courses] = await pool.query('Select * from courses where id=?',[req.params.id]);
        if(courses.length===0){
            return res.status(404).json({error:'Course not found'});
        }

        const [lessons] = await pool.query(
            'Select * from lessons where course_id=? order by lesson_order',[req.params.id]
        );

        const course = courses[0];
        course.lessons = lessons;

        res.json(course);
    }

    catch(err){
        res.status(500).json({error:err.message});
    }
});

app.post('/api/courses',authMiddleware,async(req,res)=>{
    const connection = await pool.getConnection();
     try{
        await connection.beginTransaction();
       
        const {title,description,instructor , duration} = req.body;

        const [courseResult] = await connection.query(
            'Insert into courses(title,course_description,instructor,duration,created_by) values(?,?,?,?,?)',[title,description,instructor,duration,req.userId]

        );
        const courseId = courseResult.insertId;
        const lessons =[
            'Introduction',
            'Main Content',
            'Advanced Topics',
            'Practice Exercises',
            'Final Assessment'
        ];

        for(let i=0 ; i<lessons.length ; i++){
            await connection.query(
                'Insert into lessons(course_id,title,lesson_order) values(?,?,?)',[courseId,lessons[i],i+1]
            );
        }

        await connection.commit();

        const [courses] = await pool.query('Select * from courses where id = ?',[courseId]);
        const [courseLessons] = await pool.query(
            'Select * from lessons where course_id=? order by lesson_order',[courseId]
        );

        const course = courses[0];
        course.lessons = courseLessons;

        res.json(course);
     }
     catch(err){
        await connection.rollback();
        res.status(500).json({error:err.message});
     }
     finally{
        connection.release();
     }
});


app.post('/api/enrollments/:courseId',authMiddleware,async (req,res)=>{
    try{
        const [courses] = await pool.query('select * from courses where id =?',[req.params.courseId]);

        if (courses.length === 0){
            return res.status(404).json({error:'Course not found'});
        }

        const [enrollments] = await pool.query(
            'select * from enrollments where user_id=? and course_id=? ',[req.userId,req.params.courseId]

        );

        if (enrollments.length>0){
            return res.status(400).json({error:'Already enrolled in this course'})
        }

        await pool.query('Insert into enrollments(user_id,course_id) values(?,?)'
            ,[req.userId,req.params.courseId]);

        res.json({message:'Enrolled successfully'});
    }   catch(error){
        res.status(500).json({error:error.message});
    }
});

app.get('/api/enrollments/my-courses',authMiddleware,async(req,res)=>{
    try{
        const [courses] = await pool.query(
            `
            Select c.* , 
            Count(Distinct l.id) as total_lessons,
            count(Distinct case when lp.completed = TRUE then lp.id end) as completed_lessons,
            coalesce(round((count(distinct case when lp.completed = TRUE then lp.id end)/count(distinct l.id))*100,0),0) as progress
            from enrollments e
            join courses c on e.course_id = c.id
            left join lessons l on c.id = l.course_id
            left join lesson_progress lp on l.id = lp.lesson_id and lp.user_id = e.user_id
            where e.user_id = ? 
            group by c.id

            `,[req.userId]
        );

        for(let course of courses){
            const [lessons] = await pool.query
            (
                `
                select l.* , 
                case when lp.completed = TRUE then 1 else 0 end as completed 
                from lessons l
                left join lesson_progress lp on l.id = lp.lesson_id and lp.user_id=?
                where l.course_id = ?
                order by l.lesson_order
                `,[req.userId,course.id]
            );

            course.lessons = lessons;
            course.completedLessons = lessons.filter(l=>l.completed).map(l=>l.id);
        }

        res.json(courses);
    }
    catch(err){
        return res.status(500).json({error:err.message});
    }
});

app.put('/api/enrollments/:courseId/lessons/:lessonId',authMiddleware,async (req,res)=>{
    const connection = await pool.getConnection();

    try{
        await connection.beginTransaction();

        const [enrollments] = await connection.query(
            'Select * from enrollments where user_id=? and course_id=?',[req.userId,req.params.courseId]
        );

        if(enrollments.length===0){
            return res.status(404).json({error:'Not enrolled in the course'});
        }

        const [progress] = await connection.query(
            'select * from lesson_progress where user_id=? and lesson_id=?',
            [req.userId,req.params.lessonId]
        );

        if(progress.length===0){
            await connection.query(
                `Insert into lesson_progress (user_id,lesson_id,course_id,completed,completed_at) 
                values(?,?,?,TRUE,Now())`,[req.userId,req.params.lessonId,req.params.courseId]
            );
        }
        else{
            const newStatus = !progress[0].completed;
            await connection.query(
                `update lesson_progress set completed =?,completed_at=? where user_id=? and lesson_id=?`,
                [newStatus,newStatus ? new Date(): null , req.userId,req.params.lessonId]
            )
        }

        const [courseCheck] = await connection.query(`
                Select 
                count(Distinct l.id) as total,
                count(distinct case when lp.completed = TRUE then lp.id end) as completed 
                from lessons l
                left join lesson_progress lp on l.id = lp.lesson_id and lp.user_id=?
                where l.course_id = ?
            `,[req.userId,req.params.courseId]);

            if(courseCheck[0].total === courseCheck[0].completed && courseCheck[0].total>0){
                const [cert] = await connection.query(
                    'select * from certificates where user_id = ? and course_id = ?',
                    [req.userId,req.params.courseId]
                );

                if(cert.length === 0){
                    await connection.query(
                        'Insert into certificates(user_id,course_id) values (?,?)',
                        [req.userId,req.params.courseId]
                    );
                }
            }

            await connection.commit();
            res.json({message:'Lesson Updated'});
    
    
    }
    catch(err){
        await connection.rollback();
        res.status(500).json({error:err.message});
    }
    finally{
        connection.release();
    }
});

app.get('/api/certificates',authMiddleware,async(req,res)=>{
    try{
        const [certificates] = await pool.query(
            `
            select cert.*,
            c.title,
            c.course_description,
            c.instructor,
            c.duration
            from certificates cert
            join courses c on cert.course_id = c.id
            where cert.user_id=?
            order by cert.issued_at desc
            `,[req.userId]
        );

        res.json(certificates);
    }
    catch(err){
        res.status(500).json({error:err.message});
    }
})


app.listen(5000,()=>{
    console.log('Server is running at  http://localhost:5000');
});