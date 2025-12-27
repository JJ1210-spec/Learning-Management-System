let courses = [
    {
        id:1,
        title:"WEB-TECH Basics",
        description:"Learn basics of HTML , CSS , JS",
        instructor:"Stan R Lee",
        duration:40,
        lessons: [
            { id: 1, title: "Introduction to HTML", completed: false },
            { id: 2, title: "CSS Styling Basics", completed: false },
            { id: 3, title: "JavaScript Fundamentals", completed: false },
            { id: 4, title: "Responsive Design", completed: false },
            { id: 5, title: "Final Project", completed: false }
        ],
        enrolled: false,
        progress: 0
    },

    {
         id:2,
        title:"DATABASE MANAGEMENT",
        description:"Understand the storage of data",
        instructor:"Brock D Ray",
        duration:90,
        lessons: [
            { id: 1, title: "Introduction to DB Lifecycle", completed: false },
            { id: 2, title: "ER Diagrams + SQL", completed: false },
            { id: 3, title: "Normalization", completed: false },
            { id: 4, title: "Transaction", completed: false },
            { id: 5, title: "No-SQL", completed: false }
        ],
        enrolled: false,
        progress: 0
    },
    {
        id: 3,
        title: "Data Science Essentials",
        description: "Introduction to data analysis, visualization, and ML.",
        instructor: "Dr. Emily Chen",
        duration: 60,
        icon: "📊",
        lessons: [
            { id: 1, title: "Data Analysis with Pandas", completed: false },
            { id: 2, title: "Data Visualization", completed: false },
            { id: 3, title: "Statistical Analysis", completed: false },
            { id: 4, title: "Machine Learning Basics", completed: false },
            { id: 5, title: "Capstone Project", completed: false }
        ],
        enrolled: false,
        progress: 0
    }
];

// Initialize the app when page loads
document.addEventListener('DOMContentLoaded',function(){
    init();
});

//Initialization functions
function init(){
    renderAllCourses();
    renderEnrolledCourses();
    renderDashboard();
    updateStats();
}


//Tab switching
function switchTab(tabName){
    // Remove active class from all tabs and sections
    document.querySelectorAll('.nav-tab').forEach
    (
        tab => tab.classList.remove('active')
    );
    
    
    document.querySelectorAll('.content-section').forEach
    (
        section => section.classList.remove('active')
    );

    //clicked tab becomes active
    event.target.classList.add('active');
    document.getElementById(tabName).classList.add('active');

    if (tabName === 'dashboard') renderDashboard();
    if (tabName === 'courses') renderEnrolledCourses();
    if (tabName === 'certificates') renderCertificates();
}

function renderAllCourses(){
    const container = document.getElementById('allCourses');
    container.innerHTML = courses.map(
        course=>
            `
            <div class ="coursecard" onClick="openCourseDetail(${course.id})">
                <div class="course-content">
                    <div class="course-title">${course.title}</div>
                    <div class="course-description">${course.description}</div>
                    <div class="course-meta">
                        <span class="course-instructor">${course.instructor}</span>
                        <span class="course-duration">${course.duration}h</span>
                    </div>
                    <button class="btn btn-primary" onClick="event.stopPropagation(); enrollCourse(${course.id})">
                        ${course.enrolled ? 'Continue Learning': 'Enroll Now'}
                    </button>
                </div>
            </div>        
    `).join('');
}

function renderEnrolledCourses(){
    const container = document.getElementById('enrolledCourses')
    const enrolled = courses.filter(c=>c.enrolled);

    if(enrolled.length===0){
        container.innerHTML=`<p style="color:white; text-align:center; padding:40px;">
        No Courses enrolled yet. Browse Available courses to get started!</p>`;
        return ;
    }

    container.innerHTML = enrolled.map(course => `
        <div class ="course-card" onclick="openCourseDetail(${course.id}))">
            <div class="course-content">
                <div class="course-title">${course.title}</div>
                <div class="course-description">$${course.description}</div>
                <div class="course-meta">
                    <span class="course-instructor">${course.instructor}</span>
                    <span class="course-duration">${course.duration}h</span>
                </div>
                <div class="progress-bar">
                    <div class="progress-fill" style="width:${course.progress}%"></div>
                </div>
                <div class="progress-text">${course.progress}% Complete</div>
            </div>
        </div>
        `).join('');
}


function renderDashboard(){
    const container = document.getElementById('dashboardCourses')
    const enrolled = courses.filter(c=>c.enrolled);

    if(enrolled.length===0){
        container.innerHTML =`<p style="color:white; text-align:center; padding:40px;"> Start your learning journey by enrolling in a course!</p>`;
        return ;
    }

    container.innerHTML = enrolled.map(course => `
        <div class ="course-card" onclick="openCourseDetail(${course.id})">
            <div class="course-content">
                <div class="course-title">${course.title}</div>
                <div class="progress-bar">
                    <div class="progress-fill" style="width:${course.progress}%"></div>
                </div>
                <div class="progress-text">${course.progress}% Complete</div>
                <button class="btn btn-primary" style="margin-top:15px;">Continue</button>
            </div>
        </div>

    `).join('');
}
function enrollCourse(courseId){
    const course = courses.find(c=> c.id === courseId);
    course.enrolled= true;
    renderAllCourses();
    renderEnrolledCourses();
    renderDashboard();
    updateStats();
    alert(`Successfully enrolled in ${course.title}!`);
}

function updateStats(){
    const enrolled = courses.filter(c=>c.enrolled);
    const completed = enrolled.filter(c=>c.progress===100);
    const totalHours = enrolled.reduce((sum,c)=> sum + c.duration , 0);
    const avgProgress = enrolled.length>0
    ? Math.round(enrolled.reduce((sum,c)=> sum+ c.progress,0)/enrolled.length):0;

    document.getElementById('totalCourses').textContent = enrolled.length;
    document.getElementById('completedCourses').textContent = completed.length;
    document.getElementById('totalHours').textContent = totalHours;
    document.getElementById('avgProgress').textContent = avgProgress + '%';
}

function toggleLesson(courseId,lessonId){
    const course = courses.find(c => c.id === courseId);
    const lesson = course.lessons.find(l=>l.id===lessonId)
    lesson.completed = !lesson.completed;

    const completedCount = course.lessons.filter(l=>l.completed).length;
    course.progress = Math.round((completedCount/course.lessons.length)*100);

    openCourseDetail(courseId)
    renderEnrolledCourses();
    renderDashboard();
    updateStats();

}

function openCourseDetail(courseId){
    const course = courses.find(c=> c.id === courseId);
    const completedLessons = course.lessons.filter(l=>l.completed).length;

    document.getElementById('modalContent').innerHTML=
    `
    <h2 style="margin-bottom: 20px;">${course.title} </h2>
    <p style="color: #666; margin-bottom: 20px; line-height: 1.6;">${course.description}</p>
    <div style="display: flex; gap:30px;margin-bottom: 30px; padding: 20px ; background: white; border-radius: 10px; ">
        <div><strong>Instructor:</strong> ${course.instructor}</div>
        <div><strong>Duration:</strong> ${course.duration} hours</div>
        <div><strong>Progress:</strong> ${completedLessons}/${course.lessons.length} lessons</div>
    </div>
    <h3 style ="margin-bottom: 15px;">Course Lessons</h3>
    ${course.lessons.map(lesson=>`
    <div class="lesson-item ${lesson.completed ? 'completed':''}" onclick="toggleLesson(${course.id},${lesson.id})">
        <span>${lesson.completed?'👍🏻':'👎🏻'}${lesson.title}</span>
        <span style="color: #887; font-size:13px">${lesson.completed?'Completed': 'Not Started'}</span>
    </div>
    `).join('')}
    `;

    document.getElementById('courseModal').classList.add('active');
}

function closeModal(){
    document.getElementById('courseModal').classList.remove('active');
}

function addCourse(e){
    e.preventDefault();

    const newCourse={
        id: courses.length+1,
        title : document.getElementById('CourseTitle').value,
        description: document.getElementById('CourseDescription').value,
        instructor: document.getElementById('courseInstructor').value,
        duration: parseInt(document.getElementById('courseDuration').value),

        lessons: [
            { id: 1, title: "Introduction", completed: false },
            { id: 2, title: "Main Content", completed: false },
            { id: 3, title: "Advanced Topics", completed: false },
            { id: 4, title: "Practice Exercises", completed: false },
            { id: 5, title: "Final Assessment", completed: false }
        ],
        enrolled: false,
        progress: 0
        
    };

    courses.push(newCourse);
    renderAllCourses();

    e.target.reset();
    alert(`Course created successfully`);

    document.querySelectorAll('.nav-tab')[2].click();
}

function renderCertificates(){
    const completed = courses.filter(c=> c.enrolled && c.progress== 100)
    const container = document.getElementById('certificatesList');

    if (completed.length===0){
        container.innerHTML = `<p style="color:white;text-align:center;padding:40px;">Complete courses to earn certificates!</p>`;
        return ;
    }

    container.innerHTML = completed.map(course => 
        `
        <div class="certificate" style="margin-bottom:30px;">
            <div class="certificate" style="margin-bottom:30px">
            <div class="certificate-title">Certificate of completion</div>
            <p style="font-size:18px; margin:20px 0; ">This is to certify that</p>
            <h2 style="font-size:32px;margin:15px 0 ;color:rgb(212, 221, 85)">Student Name</h2>
            <p style="font-size:18px ; margin: 20px 0 ;">has successfully completed the course</p>
            <p style="color:rgb(109, 109, 108);margin-top: 30px;">Instructor: ${course.instructor}</p>
            <p style="color:rgb(109,109,109);">Duration:${course.duration} hours</p>
            <p style="color: #888; margin-top: 20px;">Date: ${new Date().toLocaleDateString()}</p>
        </div>
    `).join('');
}







    


