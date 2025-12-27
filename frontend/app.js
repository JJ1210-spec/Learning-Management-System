const API_URL = 'http://localhost:5000/api';

let currentUser = null;
let allCourses = [];
let enrolledCourses = [];

document.addEventListener('DOMContentLoaded',function(){
    checkAuth();
});

function checkAuth(){
    const token = localStorage.getItem('token');
    if (token){
        fetchCurrentUser();
    }else{
        showAuthPage();
    }
}

function showAuthPage(){
    document.getElementById('authPage').style.display = 'flex';
    document.getElementById('mainApp').style.display = 'none';
}

function showMainApp(){
    document.getElementById('authPage').style.display = 'none';
    document.getElementById('mainApp').style.display = 'block' ;
    init();
}

function switchAuthForm(formType){
    event.preventDefault();
    document.getElementById('loginForm').classList.remove('active');
    document.getElementById('registerForm').classList.remove('active');

    if(formType==='login'){
        document.getElementById('loginForm').classList.add('active');
    }else{
        document.getElementById('registerForm').classList.add('active');
    }
}


async function handleRegister(e){
    e.preventDefault();

    const name = document.getElementById('registerName').value;
    const email = document.getElementById('registerEmail').value;
    const password = document.getElementById('registerPassword').value;

    try{
        const response = await fetch(`${API_URL}/auth/register`,{
            method:'POST',
            headers:{'Content-Type':'application/json'},
            body: JSON.stringify({name,email,password})
        });

        const data = await response.json();

        if (response.ok){
            localStorage.setItem('token',data.token);
            currentUser = data.user;
            alert('Registration successful');
            showMainApp();
        }
        else{
            alert(data.error||'Registration failed');
        }

    }catch(err){
        alert('Error:'+err.message);
        console.error('Registration Error',err);
    }
}

async function handleLogin(e){
    e.preventDefault();

    const email = document.getElementById('loginEmail').value;
    const password = document.getElementById('loginPassword').value;

    try{
        const response = await fetch(`${API_URL}/auth/login`,{
            method:'POST',
            headers:{'Content-Type':'application/json'},
            body: JSON.stringify({email,password})
        });

        const data = await response.json();

        if(response.ok){
            localStorage.setItem('token',data.token);
            currentUser = data.user;


            alert('Login Successful');
            document.getElementById('userName').textContent = data.user.name;
            document.getElementById('userEmail').textContent = data.user.email;
            showMainApp();
        }else{
            alert(data.error||'Login failed');
        }
    }catch(error){
        alert('Error: '+error.message);
        console.error('Login Error:',error);
    }
}

async function fetchCurrentUser(){
    try{
        const response = await fetch(`${API_URL}/auth/me`,{
            headers:{'Authorization':`Bearer ${localStorage.getItem('token')}`}
        })

        if (response.ok){
            currentUser = await response.json();
            document.getElementById('userName').textContent = currentUser.name;
            document.getElementById('userEmail').textContent = currentUser.email;
            showMainApp();
        }else{
            handleLogout();
        }

    } catch(err){
        console.error('Fetch user error',err);
        handleLogout();
    }
}

function handleLogout(){
    console.log('logging out',email);
    localStorage.clear();
     currentUser = null;
    allCourses = [];

    document.getElementById('userName').textContent = '';
    document.getElementById('userEmail').textContent = '';
    localStorage.removeItem('token');
    currentUser = null;
    showAuthPage();
}

async function init(){
    await fetchAllCourses();
    await fetchEnrolledCourses();
    renderAllCourses();
    renderEnrolledCourses();
    renderDashboard();
    updateStats();
}

async function fetchAllCourses(){
    try {
        const response = await fetch(`${API_URL}/courses`);
        allCourses = await response.json();
    }
    catch(err){
        console.error('Error fetching courses:',err);
    }
}

async function fetchEnrolledCourses(){
    try{
        const response = await fetch(`${API_URL}/enrollments/my-courses`,{
            headers:{'Authorization': `Bearer ${localStorage.getItem('token')}`}
        });
           if(response.ok) {
            enrolledCourses = await response.json();
           }else{
            enrolledCourses = [];
           }
    
    }
    catch(err){
        console.error('Error fetching enrolled courses',err);
        enrolledCourses=[];
    }
}

async function enrollCourse(courseId){
    try{
        const token = localStorage.getItem('token');
        
        if (!token) {
            alert('Please login first!');
            return;
        }
        const response = await fetch(`${API_URL}/enrollments/${courseId}`,{
            method: 'POST',
            headers:{'Authorization':`Bearer ${localStorage.getItem('token')}`}
        });
        const data = await response.json()
        if(response.ok){
            alert('Successfully enrolled');
            await init();
        }
        else{
            const data = await response.json();
            alert(data.error || 'Enrollment failed');
        }

      
    }
    catch(err){
        alert('Error: '+ err.message);
    }
}

async function toggleLesson(courseId,lessonId){
    try{
        const response = await fetch(`${API_URL}/enrollments/${courseId}/lessons/${lessonId}`,{
            method:'PUT',
            headers:{'Authorization': `Bearer ${localStorage.getItem('token')}`}
        });

        if (response.ok){
            await init();
            openCourseDetail(courseId);
        }
    }catch(err){
        console.log('Error toggling lessons:',err);
    }
}

async function addCourse(e) {
    e.preventDefault();

    const title = document.getElementById('courseTitle').value;
    const description = document.getElementById('courseDescription').value;
    const instructor = document.getElementById('courseInstructor').value;
    const duration = parseInt(document.getElementById('courseDuration').value);

    try{
        const response = await fetch(`${API_URL}/courses`,{
            method:'POST',
            headers:{
                'Content-Type':'application/json',
                'Authorization':`Bearer ${localStorage.getItem('token')}`
            },
            body:JSON.stringify({title,description,instructor,duration})
        });

        if (response.ok){
            alert('Course Created successfully');
            e.target.reset();
            await fetchAllCourses();
            renderAllCourses();
            document.querySelectorAll('.nav-tab')[2].click();
        }else{
            const data = await response.json();
            alert(data.error||'Failed to create course');
        }
    }
    catch(err){
        alert('Error: '+ err.message);
    }
}


function switchTab(tabName) {
    document.querySelectorAll('.nav-tab').forEach(tab => tab.classList.remove('active'));
    document.querySelectorAll('.content-section').forEach(section => section.classList.remove('active'));
    
    event.target.classList.add('active');
    document.getElementById(tabName).classList.add('active');
    
    if (tabName === 'dashboard') renderDashboard();
    if (tabName === 'courses') renderEnrolledCourses();
    if (tabName === 'certificates') renderCertificates();
}

function renderAllCourses() {
    const container = document.getElementById('all-courses');
    container.innerHTML = allCourses.map(course => {
        const isEnrolled = enrolledCourses.some(ec => ec.id === course.id);
        return `
            <div class="course-card" onclick="openCourseDetail(${course.id})">
                <div class="course-content">
                    <div class="course-title">${course.title}</div>
                    <div class="course-description">${course.course_description}</div>
                    <div class="course-meta">
                        <span class="course-instructor">${course.instructor}</span>
                        <span class="course-duration">${course.duration}h</span>
                    </div>
                    <button class="btn btn-primary" onclick="event.stopPropagation(); enrollCourse(${course.id})">
                        ${isEnrolled ? 'Continue Learning' : 'Enroll Now'}
                    </button>
                </div>
            </div>
        `;
    }).join('');
}

function renderEnrolledCourses() {
    const container = document.getElementById('enrolledCourses');
    
    if (enrolledCourses.length === 0) {
        container.innerHTML = `<p style="color:white; text-align:center; padding:40px;">
            No courses enrolled yet. Browse available courses to get started!</p>`;
        return;
    }
    
    container.innerHTML = enrolledCourses.map(course => `
        <div class="course-card" onclick="openCourseDetail(${course.id})">
            <div class="course-content">
                <div class="course-title">${course.title}</div>
                <div class="course-description">${course.course_description}</div>
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

function renderDashboard() {
    const container = document.getElementById('dashboardCourses');
    
    if (enrolledCourses.length === 0) {
        container.innerHTML = `<p style="color:white; text-align:center; padding:40px;">
            Start your learning journey by enrolling in a course!</p>`;
        return;
    }
    
    container.innerHTML = enrolledCourses.map(course => `
        <div class="course-card" onclick="openCourseDetail(${course.id})">
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

function updateStats() {
    const completed = enrolledCourses.filter(c => c.progress === 100);
    const totalHours = enrolledCourses.reduce((sum, c) => sum + c.duration, 0);
    const avgProgress = enrolledCourses.length > 0
  ? Math.round(
      enrolledCourses.reduce((sum, c) => sum +Math.min(100, Number(c.progress)), 0) 
      / enrolledCourses.length
    )
  : 0;

    document.getElementById('totalCourses').textContent = enrolledCourses.length;
    document.getElementById('completedCourses').textContent = completed.length;
    document.getElementById('totalHours').textContent = totalHours;
    document.getElementById('avgProgress').textContent = avgProgress +'%';
}

function openCourseDetail(courseId) {
    const course = enrolledCourses.find(c => c.id === courseId) || 
                   allCourses.find(c => c.id === courseId);
    
    if (!course) return;
    
    const completedLessons = course.completedLessons ? course.completedLessons.length : 0;
    const totalLessons = course.lessons ? course.lessons.length : course.lesson_count || 0;
    
    document.getElementById('modalContent').innerHTML = `
        <h2 style="margin-bottom: 20px;">${course.title}</h2>
        <p style="color: #666; margin-bottom: 20px; line-height: 1.6;">${course.course_description}</p>
        <div style="display: flex; gap:30px; margin-bottom: 30px; padding: 20px; background: #f5f5f5; border-radius: 10px;">
            <div><strong>Instructor:</strong> ${course.instructor}</div>
            <div><strong>Duration:</strong> ${course.duration} hours</div>
            <div><strong>Progress:</strong> ${completedLessons}/${totalLessons} lessons</div>
        </div>
        <h3 style="margin-bottom: 15px;">Course Lessons</h3>
        ${course.lessons ? course.lessons.map(lesson => {
            const isCompleted = course.completedLessons && course.completedLessons.includes(lesson.id);
            return `
                <div class="lesson-item ${isCompleted ? 'completed' : ''}" 
                     onclick="toggleLesson(${course.id}, ${lesson.id})">
                    <span>${isCompleted ? '✅' : '⭕'} ${lesson.title}</span>
                    <span style="color: #888; font-size:13px">${isCompleted ? 'Completed' : 'Not Started'}</span>
                </div>
            `;
        }).join('') : '<p>No lessons available</p>'}
    `;
    
    document.getElementById('courseModal').classList.add('active');
}

function closeModal() {
    document.getElementById('courseModal').classList.remove('active');
}

async function renderCertificates() {
    const container = document.getElementById('certificatesList');
    
    try {
        const response = await fetch(`${API_URL}/certificates`, {
            headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
        });
        
        if (!response.ok) {
            container.innerHTML = `<p style="color:white; text-align:center; padding:40px;">
                Complete courses to earn certificates!</p>`;
            return;
        }
        
        const certificates = await response.json();
        
        if (certificates.length === 0) {
            container.innerHTML = `<p style="color:white; text-align:center; padding:40px;">
                Complete courses to earn certificates!</p>`;
            return;
        }
        
        container.innerHTML = certificates.map(cert => `
            <div class="certificate" style="margin-bottom:30px;">
                <div class="certificate-title">Certificate of Completion</div>
                <p style="font-size:18px; margin:20px 0;">This is to certify that</p>
                <h2 style="font-size:32px; margin:15px 0; color:rgb(212, 221, 85)">${currentUser.name}</h2>
                <p style="font-size:18px; margin:20px 0;">has successfully completed the course</p>
                <h3 style="font-size:24px; margin:15px 0;">${cert.title}</h3>
                <p style="color:rgb(109, 109, 108); margin-top: 30px;">Instructor: ${cert.instructor}</p>
                <p style="color:rgb(109,109,109);">Duration: ${cert.duration} hours</p>
                <p style="color: #888; margin-top: 20px;">Date: ${new Date(cert.issued_at).toLocaleDateString()}</p>
            </div>
        `).join('');
    } catch (error) {
        console.error('Error fetching certificates:', error);
        container.innerHTML = `<p style="color:white; text-align:center; padding:40px;">
            Error loading certificates.</p>`;
    }
}
