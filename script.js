// Data Storage (In a real app, this would be a database)
let students = JSON.parse(localStorage.getItem('students')) || [];
let teachers = JSON.parse(localStorage.getItem('teachers')) || [];
let attendance = JSON.parse(localStorage.getItem('attendance')) || [];
let currentUser = JSON.parse(localStorage.getItem('currentUser')) || null;

// Function to get available classrooms for each grade (dynamically from registered students)
function getAvailableClassrooms(grade) {
    const gradeStudents = students.filter(s => s.grade === grade);
    const classrooms = [...new Set(gradeStudents.map(s => s.classroom))];
    return classrooms.sort();
}

// Initialize the app
document.addEventListener('DOMContentLoaded', function() {
    // Set today's date for teacher dashboard
    const today = new Date().toISOString().split('T')[0];
    document.getElementById('attendance-date').value = today;
    
    // Check if user is already logged in
    if (currentUser) {
        if (currentUser.role === 'student') {
            showStudentDashboard();
        } else {
            showTeacherDashboard();
        }
    } else {
        showRoleSelection();
    }
    
    // Setup event listeners
    setupEventListeners();
});

function setupEventListeners() {
    // Student forms
    document.getElementById('student-login-form').addEventListener('submit', handleStudentLogin);
    document.getElementById('student-register-form').addEventListener('submit', handleStudentRegister);
    
    // Teacher forms
    document.getElementById('teacher-login-form').addEventListener('submit', handleTeacherLogin);
    document.getElementById('teacher-register-form').addEventListener('submit', handleTeacherRegister);
    
    // No longer need grade selection listener for student registration since classroom is now text input
    
    // Grade selection for teacher dashboard
    document.getElementById('teacher-grade-select').addEventListener('change', updateTeacherClassrooms);
    document.getElementById('teacher-classroom-select').addEventListener('change', enableLoadButton);
}

// Navigation functions
function showRoleSelection() {
    hideAllSections();
    document.querySelector('.role-selection').classList.remove('hidden');
}

function showStudentLogin() {
    hideAllSections();
    document.getElementById('student-section').classList.remove('hidden');
    document.getElementById('student-login-form').classList.remove('hidden');
    document.getElementById('student-register-form').classList.add('hidden');
    document.getElementById('student-login-tab').classList.add('active');
    document.getElementById('student-register-tab').classList.remove('active');
}

function showStudentRegister() {
    document.getElementById('student-login-form').classList.add('hidden');
    document.getElementById('student-register-form').classList.remove('hidden');
    document.getElementById('student-login-tab').classList.remove('active');
    document.getElementById('student-register-tab').classList.add('active');
}

function showTeacherLogin() {
    hideAllSections();
    document.getElementById('teacher-section').classList.remove('hidden');
    document.getElementById('teacher-login-form').classList.remove('hidden');
    document.getElementById('teacher-register-form').classList.add('hidden');
    document.getElementById('teacher-login-tab').classList.add('active');
    document.getElementById('teacher-register-tab').classList.remove('active');
}

function showTeacherRegister() {
    document.getElementById('teacher-login-form').classList.add('hidden');
    document.getElementById('teacher-register-form').classList.remove('hidden');
    document.getElementById('teacher-login-tab').classList.remove('active');
    document.getElementById('teacher-register-tab').classList.add('active');
}

function hideAllSections() {
    document.querySelector('.role-selection').classList.add('hidden');
    document.getElementById('student-section').classList.add('hidden');
    document.getElementById('teacher-section').classList.add('hidden');
    document.getElementById('student-dashboard').classList.add('hidden');
    document.getElementById('teacher-dashboard').classList.add('hidden');
}

// Authentication functions
function handleStudentLogin(e) {
    e.preventDefault();
    const username = document.getElementById('student-username').value;
    const password = document.getElementById('student-password').value;
    
    const student = students.find(s => s.username === username && s.password === password);
    
    if (student) {
        currentUser = { ...student, role: 'student' };
        localStorage.setItem('currentUser', JSON.stringify(currentUser));
        showStudentDashboard();
    } else {
        showCustomAlert('Սխալ օգտատիրոջ անուն կամ գաղտնաբառ', 'error', 'Մուտքի սխալ');
    }
}

function handleStudentRegister(e) {
    e.preventDefault();
    const name = document.getElementById('reg-student-name').value.trim();
    const username = document.getElementById('reg-student-username').value.trim();
    const password = document.getElementById('reg-student-password').value;
    const grade = document.getElementById('reg-student-grade').value;
    const classroom = document.getElementById('reg-student-classroom').value.trim();
    
    // Validate all fields
    if (!name || !username || !password || !grade || !classroom) {
        showCustomAlert('Խնդրում ենք լրացնել բոլոր դաշտերը', 'warning', 'Լրացման սխալ');
        return;
    }
    
    // Check if username already exists
    if (students.find(s => s.username === username)) {
        showCustomAlert('Այս օգտատիրոջ անունն արդեն գոյություն ունի', 'warning', 'Գրանցման սխալ');
        return;
    }
    
    const newStudent = {
        id: Date.now(),
        name,
        username,
        password,
        grade,
        classroom
    };
    
    students.push(newStudent);
    saveStudentData();
    
    showCustomAlert('Գրանցումը հաջող է: Խնդրում ենք մուտք գործել', 'success', 'Հաջող գրանցում');
    setTimeout(showStudentLogin, 1500);
}

function handleTeacherLogin(e) {
    e.preventDefault();
    const username = document.getElementById('teacher-username').value;
    const password = document.getElementById('teacher-password').value;
    
    const teacher = teachers.find(t => t.username === username && t.password === password);
    
    if (teacher) {
        currentUser = { ...teacher, role: 'teacher' };
        localStorage.setItem('currentUser', JSON.stringify(currentUser));
        showTeacherDashboard();
    } else {
        alert('Սխալ օգտատիրոջ անուն կամ գաղտնաբառ');
    }
}

function handleTeacherRegister(e) {
    e.preventDefault();
    const name = document.getElementById('reg-teacher-name').value;
    const username = document.getElementById('reg-teacher-username').value;
    const password = document.getElementById('reg-teacher-password').value;
    const subject = document.getElementById('reg-teacher-subject').value;
    
    // Check if username already exists
    if (teachers.find(t => t.username === username)) {
        alert('Այս օգտատիրոջ անունն արդեն գոյություն ունի');
        return;
    }
    
    const newTeacher = {
        id: Date.now(),
        name,
        username,
        password,
        subject
    };
    
    teachers.push(newTeacher);
    saveTeacherData();
    
    alert('Գրանցումը հաջող էր: Խնդրում ենք մուտք գործել');
    showTeacherLogin();
}

// Dashboard functions
function showStudentDashboard() {
    hideAllSections();
    document.getElementById('student-dashboard').classList.remove('hidden');
    
    // Update student info display
    document.getElementById('student-name-display').textContent = currentUser.name;
    document.getElementById('student-grade-display').textContent = currentUser.grade + '-րդ դասարան';
    document.getElementById('student-classroom-display').textContent = currentUser.classroom;
    
    // Check today's attendance
    checkTodayAttendance();
    
    // Load attendance history
    loadStudentHistory();
}

function showTeacherDashboard() {
    hideAllSections();
    document.getElementById('teacher-dashboard').classList.remove('hidden');
    
    // Update teacher info display
    document.getElementById('teacher-name-display').textContent = currentUser.name;
    document.getElementById('teacher-subject-display').textContent = currentUser.subject;
    
    // Reset class selection
    document.getElementById('teacher-grade-select').value = '';
    document.getElementById('teacher-classroom-select').value = '';
    document.getElementById('teacher-classroom-select').innerHTML = '<option value="">Ընտրեք դասասենյակը</option>';
    document.getElementById('load-attendance-btn').disabled = true;
    document.getElementById('class-attendance').classList.add('hidden');
}

// Attendance functions
function checkTodayAttendance() {
    const today = new Date().toISOString().split('T')[0];
    const todayAttendance = attendance.find(a => 
        a.studentId === currentUser.id && a.date === today
    );
    
    if (todayAttendance) {
        const status = todayAttendance.status === 'present' ? 'ներկա' : 'բացակա';
        const statusClass = todayAttendance.status === 'present' ? 'status-present' : 'status-absent';
        
        document.getElementById('attendance-message').innerHTML = 
            `Այսօր դուք նշվել եք որպես <span class="${statusClass}">${status}</span>`;
        document.getElementById('attendance-buttons').style.display = 'none';
    } else {
        document.getElementById('attendance-message').textContent = 'Այսօր դեռ ներկայություն չեք նշել';
        document.getElementById('attendance-buttons').style.display = 'flex';
    }
}

function markAttendance(status) {
    const today = new Date().toISOString().split('T')[0];
    
    // Check if already marked today
    const existingAttendance = attendance.find(a => 
        a.studentId === currentUser.id && a.date === today
    );
    
    if (existingAttendance) {
        alert('Այսօր արդեն ներկայություն եք նշել');
        return;
    }
    
    const newAttendance = {
        studentId: currentUser.id,
        studentName: currentUser.name,
        grade: currentUser.grade,
        classroom: currentUser.classroom,
        date: today,
        status: status,
        timestamp: new Date().toISOString()
    };
    
    attendance.push(newAttendance);
    saveAttendanceData();
    
    checkTodayAttendance();
    loadStudentHistory();
    
    const statusText = status === 'present' ? 'ներկա' : 'բացակա';
    alert(`Դուք նշվել եք որպես ${statusText}`);
}

function loadStudentHistory() {
    const studentAttendance = attendance
        .filter(a => a.studentId === currentUser.id)
        .sort((a, b) => new Date(b.date) - new Date(a.date));
    
    const historyContainer = document.getElementById('student-history');
    
    if (studentAttendance.length === 0) {
        historyContainer.innerHTML = '<p>Ներկայության պատմություն չկա</p>';
        return;
    }
    
    historyContainer.innerHTML = studentAttendance
        .map(a => {
            const statusText = a.status === 'present' ? 'Ներկա' : 'Բացակա';
            const statusClass = a.status === 'present' ? 'status-present' : 'status-absent';
            const date = new Date(a.date).toLocaleDateString('hy-AM');
            
            return `
                <div class="history-item">
                    <span>${date}</span>
                    <span class="${statusClass}">${statusText}</span>
                </div>
            `;
        })
        .join('');
}

// Teacher functions
function updateTeacherClassrooms() {
    const grade = document.getElementById('teacher-grade-select').value;
    const classroomSelect = document.getElementById('teacher-classroom-select');
    
    classroomSelect.innerHTML = '<option value="">Ընտրեք դասասենյակը</option>';
    
    if (grade) {
        const availableClassrooms = getAvailableClassrooms(grade);
        
        if (availableClassrooms.length > 0) {
            availableClassrooms.forEach(classroom => {
                const option = document.createElement('option');
                option.value = classroom;
                option.textContent = grade + classroom;
                classroomSelect.appendChild(option);
            });
        } else {
            const option = document.createElement('option');
            option.value = "";
            option.textContent = "Այս դասարանում դեռ աշակերտներ չկան";
            option.disabled = true;
            classroomSelect.appendChild(option);
        }
    }
    
    document.getElementById('load-attendance-btn').disabled = true;
    document.getElementById('class-attendance').classList.add('hidden');
}

function enableLoadButton() {
    const grade = document.getElementById('teacher-grade-select').value;
    const classroom = document.getElementById('teacher-classroom-select').value;
    
    document.getElementById('load-attendance-btn').disabled = !(grade && classroom);
}

function loadClassAttendance() {
    const grade = document.getElementById('teacher-grade-select').value;
    const classroom = document.getElementById('teacher-classroom-select').value;
    const date = document.getElementById('attendance-date').value;
    
    if (!grade || !classroom) {
        alert('Խնդրում ենք ընտրել դասարանը և դասասենյակը');
        return;
    }
    
    // Get all students in this class
    const classStudents = students.filter(s => s.grade === grade && s.classroom === classroom);
    
    // Get attendance for this date and class
    const dayAttendance = attendance.filter(a => 
        a.grade === grade && a.classroom === classroom && a.date === date
    );
    
    // Create attendance map for quick lookup
    const attendanceMap = {};
    dayAttendance.forEach(a => {
        attendanceMap[a.studentId] = a.status;
    });
    
    // Display students
    const studentsContainer = document.getElementById('students-list');
    
    if (classStudents.length === 0) {
        studentsContainer.innerHTML = '<p>Այս դասարանում աշակերտներ չկան</p>';
    } else {
        studentsContainer.innerHTML = classStudents
            .map(student => {
                const attendanceStatus = attendanceMap[student.id] || 'not-marked';
                let statusText, statusClass;
                
                switch (attendanceStatus) {
                    case 'present':
                        statusText = 'Ներկա';
                        statusClass = 'badge-present';
                        break;
                    case 'absent':
                        statusText = 'Բացակա';
                        statusClass = 'badge-absent';
                        break;
                    default:
                        statusText = 'Չի նշվել';
                        statusClass = 'badge-not-marked';
                }
                
                return `
                    <div class="student-card">
                        <h4>${student.name}</h4>
                        <div class="student-info">
                            <p>Դասարան: ${student.grade}${student.classroom}</p>
                            <p>Օգտատիրոջ անուն: ${student.username}</p>
                        </div>
                        <span class="attendance-badge ${statusClass}">${statusText}</span>
                    </div>
                `;
            })
            .join('');
    }
    
    document.getElementById('class-attendance').classList.remove('hidden');
}

// Data Export and Backup Functions
function exportAllData() {
    const allData = {
        students: students,
        teachers: teachers,
        attendance: attendance,
        exportDate: new Date().toISOString(),
        version: "1.0"
    };
    
    const dataStr = JSON.stringify(allData, null, 2);
    const dataBlob = new Blob([dataStr], {type: 'application/json'});
    
    const link = document.createElement('a');
    link.href = URL.createObjectURL(dataBlob);
    link.download = `classlink-backup-${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    
    showCustomAlert('Տվյալների արտահանումը հաջողվեց', 'success');
}

function exportAttendanceReport() {
    if (attendance.length === 0) {
        showCustomAlert('Ներկայության տվյալներ չկան', 'warning');
        return;
    }
    
    // Create CSV format
    const csvHeader = 'Ամսաթիվ,Աշակերտի անուն,Դասարան,Դասասենյակ,Կարգավիճակ,Ժամ\n';
    const csvContent = attendance.map(record => {
        const date = new Date(record.date).toLocaleDateString('hy-AM');
        const time = new Date(record.timestamp).toLocaleTimeString('hy-AM');
        const status = record.status === 'present' ? 'Ներկա' : 'Բացակա';
        
        return `"${date}","${record.studentName}","${record.grade}","${record.classroom}","${status}","${time}"`;
    }).join('\n');
    
    const csvData = csvHeader + csvContent;
    const csvBlob = new Blob([csvData], {type: 'text/csv;charset=utf-8;'});
    
    const link = document.createElement('a');
    link.href = URL.createObjectURL(csvBlob);
    link.download = `attendance-report-${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
    
    showCustomAlert('Ներկայության հաշվետվությունը արտահանվեց', 'success');
}

function exportStudentsList() {
    if (students.length === 0) {
        showCustomAlert('Աշակերտների ցուցակ չկա', 'warning');
        return;
    }
    
    const csvHeader = 'Անուն,Օգտատիրոջ անուն,Դասարան,Դասասենյակ,Գրանցման ամսաթիվ\n';
    const csvContent = students.map(student => {
        const registrationDate = new Date(student.id).toLocaleDateString('hy-AM');
        return `"${student.name}","${student.username}","${student.grade}","${student.classroom}","${registrationDate}"`;
    }).join('\n');
    
    const csvData = csvHeader + csvContent;
    const csvBlob = new Blob([csvData], {type: 'text/csv;charset=utf-8;'});
    
    const link = document.createElement('a');
    link.href = URL.createObjectURL(csvBlob);
    link.download = `students-list-${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
    
    showCustomAlert('Աշակերտների ցուցակը արտահանվեց', 'success');
}

function exportTeachersList() {
    if (teachers.length === 0) {
        showCustomAlert('Ուսուցիչների ցուցակ չկա', 'warning');
        return;
    }
    
    const csvHeader = 'Անուն,Օգտատիրոջ անուն,Առարկա,Գրանցման ամսաթիվ\n';
    const csvContent = teachers.map(teacher => {
        const registrationDate = new Date(teacher.id).toLocaleDateString('hy-AM');
        return `"${teacher.name}","${teacher.username}","${teacher.subject}","${registrationDate}"`;
    }).join('\n');
    
    const csvData = csvHeader + csvContent;
    const csvBlob = new Blob([csvData], {type: 'text/csv;charset=utf-8;'});
    
    const link = document.createElement('a');
    link.href = URL.createObjectURL(csvBlob);
    link.download = `teachers-list-${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
    
    showCustomAlert('Ուսուցիչների ցուցակը արտահանվեց', 'success');
}

function importData() {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    
    input.onchange = function(event) {
        const file = event.target.files[0];
        if (!file) return;
        
        const reader = new FileReader();
        reader.onload = function(e) {
            try {
                const importedData = JSON.parse(e.target.result);
                
                if (importedData.students && importedData.teachers && importedData.attendance) {
                    // Merge data (avoid duplicates)
                    importedData.students.forEach(student => {
                        if (!students.find(s => s.username === student.username)) {
                            students.push(student);
                        }
                    });
                    
                    importedData.teachers.forEach(teacher => {
                        if (!teachers.find(t => t.username === teacher.username)) {
                            teachers.push(teacher);
                        }
                    });
                    
                    importedData.attendance.forEach(record => {
                        if (!attendance.find(a => a.studentId === record.studentId && a.date === record.date)) {
                            attendance.push(record);
                        }
                    });
                    
                    // Save to localStorage
                    localStorage.setItem('students', JSON.stringify(students));
                    localStorage.setItem('teachers', JSON.stringify(teachers));
                    localStorage.setItem('attendance', JSON.stringify(attendance));
                    
                    showCustomAlert('Տվյալների ներմուծումը հաջողվեց', 'success');
                } else {
                    showCustomAlert('Անվավեր ֆայլի ֆորմատ', 'error');
                }
            } catch (error) {
                showCustomAlert('Ֆայլի կարդալու սխալ', 'error');
            }
        };
        reader.readAsText(file);
    };
    
    input.click();
}

// Enhanced save functions with automatic backup
function saveStudentData() {
    localStorage.setItem('students', JSON.stringify(students));
    // Create automatic backup every 10 new registrations
    if (students.length % 10 === 0) {
        createAutomaticBackup('students');
    }
}

function saveTeacherData() {
    localStorage.setItem('teachers', JSON.stringify(teachers));
    // Create automatic backup every 5 new registrations
    if (teachers.length % 5 === 0) {
        createAutomaticBackup('teachers');
    }
}

function saveAttendanceData() {
    localStorage.setItem('attendance', JSON.stringify(attendance));
    // Create automatic backup every 50 new attendance records
    if (attendance.length % 50 === 0) {
        createAutomaticBackup('attendance');
    }
}

function createAutomaticBackup(dataType) {
    const backup = {
        type: dataType,
        data: dataType === 'students' ? students : dataType === 'teachers' ? teachers : attendance,
        timestamp: new Date().toISOString()
    };
    
    const backupKey = `backup_${dataType}_${new Date().toISOString().split('T')[0]}`;
    localStorage.setItem(backupKey, JSON.stringify(backup));
    
    // Keep only last 5 backups
    const backupKeys = Object.keys(localStorage).filter(key => key.startsWith(`backup_${dataType}`));
    if (backupKeys.length > 5) {
        backupKeys.sort().slice(0, -5).forEach(key => localStorage.removeItem(key));
    }
}

// Sound effects for alerts
const alertSounds = {
    success: () => playFrequency([523.25, 659.25, 783.99], 0.3, 'sine'), // C5, E5, G5 - Major chord
    error: () => playFrequency([220, 196, 174.61], 0.5, 'square'), // A3, G3, F3 - Descending
    warning: () => playFrequency([440, 554.37, 440], 0.4, 'triangle'), // A4, C#5, A4 - Warning pattern
    info: () => playFrequency([523.25, 659.25], 0.3, 'sine') // C5, E5 - Pleasant tone
};

function playFrequency(frequencies, duration, waveType = 'sine') {
    if (typeof(AudioContext) !== "undefined" || typeof(webkitAudioContext) !== "undefined") {
        try {
            const audioContext = new (window.AudioContext || window.webkitAudioContext)();
            
            frequencies.forEach((freq, index) => {
                const oscillator = audioContext.createOscillator();
                const gainNode = audioContext.createGain();
                const filterNode = audioContext.createBiquadFilter();
                
                // Create audio chain: oscillator -> filter -> gain -> destination
                oscillator.connect(filterNode);
                filterNode.connect(gainNode);
                gainNode.connect(audioContext.destination);
                
                oscillator.frequency.setValueAtTime(freq, audioContext.currentTime);
                oscillator.type = waveType;
                
                // Add subtle filter for warmer sound
                filterNode.type = 'lowpass';
                filterNode.frequency.setValueAtTime(2000, audioContext.currentTime);
                filterNode.Q.setValueAtTime(1, audioContext.currentTime);
                
                // Smooth volume envelope
                gainNode.gain.setValueAtTime(0, audioContext.currentTime);
                gainNode.gain.linearRampToValueAtTime(0.08, audioContext.currentTime + 0.02);
                gainNode.gain.exponentialRampToValueAtTime(0.001, audioContext.currentTime + duration);
                
                const startTime = audioContext.currentTime + index * 0.15;
                oscillator.start(startTime);
                oscillator.stop(startTime + duration);
            });
        } catch (error) {
            console.warn('Audio not available:', error);
        }
    }
}

// Dark mode detection
function isDarkMode() {
    return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
}

// Sound preferences
let soundEnabled = localStorage.getItem('soundEnabled') !== 'false'; // Default enabled

function toggleSound() {
    soundEnabled = !soundEnabled;
    localStorage.setItem('soundEnabled', soundEnabled);
    updateSoundButton();
    
    // Don't play sound for the toggle message itself to avoid recursion
    const oldSoundEnabled = soundEnabled;
    const tempSoundEnabled = false;
    
    setTimeout(() => {
        showCustomAlert(
            soundEnabled ? 'Ձայնային էֆեկտները միացված են' : 'Ձայնային էֆեկտները անջատված են',
            'info',
            'Ձայնային կարգավորումներ'
        );
    }, 100);
}

function updateSoundButton() {
    const soundButton = document.getElementById('sound-toggle');
    if (soundButton) {
        soundButton.textContent = soundEnabled ? '🔊 Ձայն' : '🔇 Ձայն';
        soundButton.classList.toggle('disabled', !soundEnabled);
    }
}

// Initialize sound button on page load
document.addEventListener('DOMContentLoaded', function() {
    setTimeout(updateSoundButton, 100); // Small delay to ensure button exists
});

// Custom alert system with enhanced animations and sound
function showCustomAlert(message, type = 'info', title = 'Ծանուցում') {
    const alertOverlay = document.getElementById('custom-alert');
    const alertTitle = document.getElementById('alert-title');
    const alertMessage = document.getElementById('alert-message');
    const alertIcon = document.getElementById('alert-icon-content');
    const alertIconContainer = document.querySelector('.alert-icon');
    const alertModal = document.querySelector('.alert-modal');
    
    // Play sound effect with visual indicator
    if (alertSounds[type] && soundEnabled) {
        alertModal.classList.add('playing-sound');
        alertSounds[type]();
        setTimeout(() => {
            alertModal.classList.remove('playing-sound');
        }, 300);
    }
    
    // Apply dark mode if needed
    if (isDarkMode()) {
        alertModal.classList.add('dark-mode');
    } else {
        alertModal.classList.remove('dark-mode');
    }
    
    alertTitle.textContent = title;
    alertMessage.textContent = message;
    
    // Clear previous type classes
    alertIconContainer.className = 'alert-icon';
    alertModal.classList.remove('alert-success', 'alert-error', 'alert-warning', 'alert-info');
    
    // Set icon and animations based on type
    switch (type) {
        case 'success':
            alertIcon.textContent = '✅';
            alertIconContainer.classList.add('success');
            alertModal.classList.add('alert-success');
            // Add confetti animation
            createConfetti();
            break;
        case 'error':
            alertIcon.textContent = '❌';
            alertIconContainer.classList.add('error');
            alertModal.classList.add('alert-error');
            // Add shake animation
            alertModal.style.animation = 'alertShake 0.6s ease-in-out';
            break;
        case 'warning':
            alertIcon.textContent = '⚠️';
            alertIconContainer.classList.add('warning');
            alertModal.classList.add('alert-warning');
            // Add pulse animation
            alertModal.style.animation = 'alertPulse 0.8s ease-in-out';
            break;
        default:
            alertIcon.textContent = 'ℹ️';
            alertIconContainer.classList.add('info');
            alertModal.classList.add('alert-info');
            // Add slide animation
            alertModal.style.animation = 'alertSlideDown 0.5s ease-out';
    }
    
    alertOverlay.classList.remove('hidden');
    
    // Reset animation after it completes
    setTimeout(() => {
        alertModal.style.animation = '';
    }, 1000);
    
    // Close alert when OK button is clicked
    document.getElementById('alert-ok-btn').onclick = function() {
        alertOverlay.classList.add('hidden');
        clearConfetti();
    };
    
    // Close alert when clicking outside
    alertOverlay.onclick = function(e) {
        if (e.target === alertOverlay) {
            alertOverlay.classList.add('hidden');
            clearConfetti();
        }
    };
}

// Confetti animation for success alerts
function createConfetti() {
    const confettiContainer = document.createElement('div');
    confettiContainer.className = 'confetti-container';
    confettiContainer.id = 'confetti-container';
    document.body.appendChild(confettiContainer);
    
    const colors = ['#f43f5e', '#8b5cf6', '#06b6d4', '#10b981', '#f59e0b', '#ef4444'];
    
    for (let i = 0; i < 50; i++) {
        const confetti = document.createElement('div');
        confetti.className = 'confetti-piece';
        confetti.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
        confetti.style.left = Math.random() * 100 + '%';
        confetti.style.animationDelay = Math.random() * 3 + 's';
        confetti.style.animationDuration = (Math.random() * 3 + 2) + 's';
        confettiContainer.appendChild(confetti);
    }
}

function clearConfetti() {
    const confettiContainer = document.getElementById('confetti-container');
    if (confettiContainer) {
        confettiContainer.remove();
    }
}

// Data statistics function
function getDataStatistics() {
    const totalStudents = students.length;
    const totalTeachers = teachers.length;
    const totalAttendanceRecords = attendance.length;
    
    const gradeStats = {};
    students.forEach(student => {
        gradeStats[student.grade] = (gradeStats[student.grade] || 0) + 1;
    });
    
    const subjectStats = {};
    teachers.forEach(teacher => {
        subjectStats[teacher.subject] = (subjectStats[teacher.subject] || 0) + 1;
    });
    
    const today = new Date().toISOString().split('T')[0];
    const todayAttendance = attendance.filter(a => a.date === today);
    const todayPresent = todayAttendance.filter(a => a.status === 'present').length;
    const todayAbsent = todayAttendance.filter(a => a.status === 'absent').length;
    
    return {
        totalStudents,
        totalTeachers,
        totalAttendanceRecords,
        gradeStats,
        subjectStats,
        todayStats: {
            present: todayPresent,
            absent: todayAbsent,
            total: todayAttendance.length
        }
    };
}

// Show statistics modal
function showDataStatistics() {
    const stats = getDataStatistics();
    
    const modal = document.createElement('div');
    modal.className = 'stats-modal';
    modal.innerHTML = `
        <div class="stats-content">
            <h3>Համակարգի վիճակագրություն</h3>
            
            <div class="stats-grid">
                <div class="stats-card">
                    <h4>Ընդամենը աշակերտներ</h4>
                    <div class="stats-number">${stats.totalStudents}</div>
                </div>
                <div class="stats-card">
                    <h4>Ընդամենը ուսուցիչներ</h4>
                    <div class="stats-number">${stats.totalTeachers}</div>
                </div>
                <div class="stats-card">
                    <h4>Ներկայության գրառումներ</h4>
                    <div class="stats-number">${stats.totalAttendanceRecords}</div>
                </div>
                <div class="stats-card">
                    <h4>Այսօրվա ներկայություն</h4>
                    <div class="stats-number">${stats.todayStats.present}/${stats.todayStats.total}</div>
                </div>
            </div>
            
            <div class="stats-details">
                <h4>Դասարանների բաշխում</h4>
                <div class="stats-list">
                    ${Object.entries(stats.gradeStats).map(([grade, count]) => 
                        `<div class="stats-item">
                            <span>${grade}-րդ դասարան</span>
                            <span>${count} աշակերտ</span>
                        </div>`
                    ).join('')}
                </div>
                
                <h4>Առարկաների բաշխում</h4>
                <div class="stats-list">
                    ${Object.entries(stats.subjectStats).map(([subject, count]) => 
                        `<div class="stats-item">
                            <span>${subject}</span>
                            <span>${count} ուսուցիչ</span>
                        </div>`
                    ).join('')}
                </div>
            </div>
            
            <button class="close-stats" onclick="this.closest('.stats-modal').remove()">Փակել</button>
        </div>
    `;
    
    // Close modal when clicking outside
    modal.onclick = function(e) {
        if (e.target === modal) {
            modal.remove();
        }
    };
    
    document.body.appendChild(modal);
}

// Logout function
function logout() {
    currentUser = null;
    localStorage.removeItem('currentUser');
    showRoleSelection();
    
    // Clear forms
    document.querySelectorAll('form').forEach(form => form.reset());
}