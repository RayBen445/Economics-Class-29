
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { createRoot } from 'react-dom/client';

// --- CONFIGURATION ---
const ADMIN_EMAIL = 'oladoyeheritage445@gmail.com';
const INITIAL_MATRIC_NUMBERS = [
    "2024013417", "2023011476", "2024003355", "2024003476", "2024003486", "2024003513", "2024003516", "2024003580", "2024003583", "2024003607", "2024013214", "2024003667", "2024003692", "2024003712", "2024003741", "2024003770", "2024003869", "2024003999", "2024004028", "2024004029", "2024004099", "2024013216", "2024004177", "2024004271", "2024004308", "2024004334", "2024004407", "2024004417", "2024004487", "2024004507", "2024004527", "2024004576", "2024013223", "2024004590", "2024004622", "2024004637", "2024004691", "2024004703", "2024004723", "2024004794", "2024004798", "2024004808", "2024004869", "2024013378", "2024004891", "2024004893", "2024004895", "2024004932", "2024004947", "2024004956", "2024004962", "2024004973", "2024005008", "2024005013", "2024013391", "2024005068", "2024005150", "2024005156", "2024005157", "2024005182", "2024005345", "2024005353", "2024005378", "2024005477", "2024005507", "2024005508", "2024005528", "2024005546", "2024005655", "2024005738", "2024005753", "2024005754", "2024005797", "2024005847", "2024005864", "2024005867", "2024005916", "2024006090", "2024006118", "2024006125", "2024006136", "2024006143", "2024006150", "2024006162", "2024006198", "2024006437", "2024006447", "2024006477", "2024006510", "2024006513", "2024006550", "2024006564", "2024006597", "2024006626", "2024006686", "2024006705", "2024006820", "2024006896", "2024006904", "2024006969", "2024006978", "2024006998", "2024007000", "2024007087", "2024007117", "2024007153", "2024007169", "2024007175", "2024007310", "2024007325", "2024007467", "2024007512", "2024007527", "2024007578", "2024007587", "2024007588", "2024007589", "2024007663", "2024007675", "2024007681", "2024007693", "2024007696", "2024007744", "2024007756", "2024007796", "2024007814", "2024007823", "2024007944", "2024007974", "2024007977", "2024008002", "2024008028", "2024008059", "2024008076", "2024008087", "2024008233", "2024008338", "2024008357", "2024008415", "2024008420", "2024008458", "2024008554", "2024008575", "2024008612", "2024008680", "2024008710", "2024008757", "2024008761", "2024008777", "2024008838", "2024008890", "2024008929", "2024008942", "2024008971", "2024009104", "2024009209", "2024009324", "2024009342", "2024009347", "2024009384", "2024009455", "2024009461", "2024009479", "2024009537", "2024009587", "2024009652", "2024009736", "2024009834", "2024009872", "2024009874", "2024009932", "2024009937", "2024009967", "2024010177", "2024010178", "2024010194", "2024010213", "2024010379", "2024010502", "2024010544", "2024010624", "2024010690", "2024010710", "2024010829", "2024010853", "2024010866", "2024010883", "2024010985", "2024011008", "2024011028", "2024011047", "2024011048", "2024011125", "2024011144", "2024011160", "2024011162", "2024011316", "2024011351", "2024011367", "2024011464", "2024011522", "2024011526", "2024011567", "2024011593", "2024011630", "2024011850", "2024011924", "2024012314", "2024012318", "2024012400", "2024012493", "2024012547", "2024012628", "2024012666", "2024012674", "2024012792", "2024012879", "2024012918", "2024012939", "2024013017", "2024013035", "2024013060", "2024013164", "2024013180",
    'ADMIN/001'
];

const INITIAL_COURSES_DATA = {
    "100 Level": {
        "Harmattan Semester": [
            { id: 101, code: "GST 111", title: "Communication in English", units: "2 units" }, { id: 102, code: "ECO 101", title: "Principles of Economics I", units: "2 units" }, { id: 103, code: "ECO 103", title: "Introductory Mathematics I", units: "2 units" }, { id: 104, code: "ECO 105", title: "Intro to Statistics for Social Sciences I", units: "2 units" }, { id: 105, code: "ECO 107", title: "Introduction to Finance", units: "2 units" }, { id: 106, code: "LIB 101", title: "Use of Library, Study Skills & ICT", units: "2 units" }, { id: 107, code: "ACC 101", title: "Principles of Accounting I", units: "2 units" }, { id: 108, code: "MKT 101", title: "Elements of Marketing I", units: "2 units" }, { id: 109, code: "SOC 111", title: "Intergroup Relations & Social Development", units: "2 units" }, { id: 110, code: "PHL 109", title: "Philosophical Problems and Analysis", units: "2 units" }, { id: 111, code: "ECO XXX", title: "Introduction to Digital (Elective)", units: "2 units" }
        ], "Rain Semester": [
            { id: 112, code: "GST 112", title: "Nigerian People and Culture", units: "2 units" }, { id: 113, code: "ECO 102", title: "Principles of Economics II", units: "3 units" }, { id: 114, code: "ECO 104", title: "Introductory Mathematics II", units: "2 units" }, { id: 115, code: "ECO 106", title: "Stats for Social Sciences II", units: "2 units" }, { id: 116, code: "ECO 108", title: "Intro to Information Technology", units: "3 units" }, { id: 117, code: "ACC 102", title: "Principles of Accounting II", units: "3 units" }, { id: 118, code: "MKT 102", title: "Elements of Marketing II", units: "2 units" }, { id: 119, code: "ENG 104", title: "Basic Writing Skills", units: "2 units" }, { id: 120, code: "POL 104", title: "Nigerian Legal System (Elective)", units: "2 units" }
        ]
    },
    "200 Level": {
        "Harmattan Semester": [
            { id: 201, code: "ENT 211", title: "Entrepreneurship and Innovation", units: "2 units" }, { id: 202, code: "ECO 201", title: "Introduction to Micro Economics I", units: "2 units" }, { id: 203, code: "ECO 203", title: "Introduction to Macro Economics I", units: "2 units" }, { id: 204, code: "ECO 205", title: "Structure of Nigerian Economy", units: "2 units" }, { id: 205, code: "ECO 207", title: "Mathematics for Economists I", units: "2 units" }, { id: 206, code: "ECO 209", title: "Statistics for Economists I", units: "2 units" }, { id: 207, code: "ECO 211", title: "Public Finance", units: "2 units" }, { id: 208, code: "HIS 207", title: "History of the Commonwealth", units: "2 units" }, { id: 209, code: "ECO 213", title: "Urban and Regional Economics (Elective)", units: "2 units" }
        ], "Rain Semester": [
            { id: 210, code: "GST 212", title: "Philosophy, Logic and Human Existence", units: "2 units" }, { id: 211, code: "SSC 202", title: "Introduction to Computer", units: "3 units" }, { id: 212, code: "ECO 202", title: "Micro Economics II", units: "2 units" }, { id: 213, code: "ECO 204", title: "Macro Economics II", units: "2 units" }, { id: 214, code: "ECO 206", title: "History of Economic Thought", units: "2 units" }, { id: 215, code: "ECO 208", title: "Math for Economists II", units: "2 units" }, { id: 216, code: "ECO 210", title: "Statistics for Economists II", units: "2 units" }, { id: 217, code: "ECO 214", title: "Transport Economics", units: "2 units" }, { id: 218, code: "ECO 216", title: "Labour Economics", units: "2 units" }
        ]
    },
    "300 Level": {
        "Harmattan Semester": [
            { id: 301, code: "SSC 301", title: "Innovation in Social Sciences", units: "2 units" }, { id: 302, code: "ECO 301", title: "Intermediate Micro I", units: "2 units" }, { id: 303, code: "ECO 303", title: "Intermediate Macro I", units: "2 units" }, { id: 304, code: "ECO 305", title: "History of Economic Thoughts", units: "2 units" }, { id: 305, code: "ECO 307", title: "Project Evaluation", units: "3 units" }, { id: 306, code: "ECO 309", title: "Econometrics", units: "2 units" }, { id: 307, code: "ECO 311", title: "Monetary Economics I", units: "2 units" }, { id: 308, code: "ECO 313", title: "International Economics I", units: "2 units" }, { id: 309, code: "ECO 315", title: "Economics of Development", units: "2 units" }
        ], "Rain Semester": [
            { id: 310, code: "GST 312", title: "Peace and Conflict Resolution", units: "2 units" }, { id: 311, code: "ENT 312", title: "Venture Creation", units: "2 units" }, { id: 312, code: "SSC 302", title: "Research Methods I", units: "2 units" }, { id: 313, code: "ECO 302", title: "Intermediate Micro II", units: "2 units" }, { id: 314, code: "ECO 304", title: "Intermediate Macro II", units: "2 units" }, { id: 315, code: "ECO 306", title: "Introductory Econometrics", units: "3 units" }, { id: 316, code: "ECO 308", title: "Operation Research", units: "2 units" }, { id: 317, code: "ECO 310", title: "Public Sector Economics", units: "2 units" }, { id: 318, code: "ECO 312", title: "Monetary Economics II", units: "2 units" }, { id: 319, code: "ECO 314", title: "International Economics II", units: "2 units" }, { id: 320, code: "ECO 3XX", title: "Industrial Economics (Elective)", units: "2 units" }
        ]
    },
    "400 Level": {
        "Harmattan Semester": [
            { id: 401, code: "SSC 401", title: "Research Methods II", units: "2 units" }, { id: 402, code: "ECO 401", title: "Advanced Microeconomics", units: "2 units" }, { id: 403, code: "ECO 403", title: "Advanced Macroeconomics", units: "2 units" }, { id: 404, code: "ECO 405", title: "Economic Planning", units: "3 units" }, { id: 405, code: "ECO 407", title: "Fiscal Policy and Analysis", units: "3 units" }, { id: 406, code: "ECO 409", title: "Comparative Economic Systems", units: "2 units" }, { id: 407, code: "ECO 411", title: "Advanced Mathematical Economics", units: "2 units" }, { id: 408, code: "ECO 413", title: "Development: Problems & Policies", units: "2 units" }, { id: 409, code: "ECO 415", title: "Economics of Production OR ECO 417 – Petroleum Economics", units: "2 units" }
        ], "Rain Semester": [
            { id: 410, code: "ECO 402", title: "Advanced Microeconomics II", units: "2 units" }, { id: 411, code: "ECO 404", title: "Advanced Macroeconomics II", units: "2 units" }, { id: 412, code: "ECO 406", title: "Project Evaluation II", units: "2 units" }, { id: 413, code: "ECO 408", title: "Economic Planning II", units: "2 units" }, { id: 414, code: "ECO 410", title: "Applied Statistics", units: "2 units" }, { id: 415, code: "ECO 499", title: "Final Year Project", units: "6 units" }, { id: 416, code: "ECO 412", title: "Advanced Econometrics OR ECO 414 – Health Economics", units: "2 units" }
        ]
    }
};

// --- HOOKS ---
const useLocalStorage = (key, initialValue) => {
    const [storedValue, setStoredValue] = useState(() => {
        try {
            const item = window.localStorage.getItem(key);
            return item ? JSON.parse(item) : initialValue;
        } catch (error) {
            console.error(error);
            return initialValue;
        }
    });

    const setValue = (value) => {
        try {
            const valueToStore = value instanceof Function ? value(storedValue) : value;
            setStoredValue(valueToStore);
            window.localStorage.setItem(key, JSON.stringify(valueToStore));
        } catch (error) {
            console.error(error);
        }
    };

    return [storedValue, setValue];
};


// --- AUTHENTICATION & MEMBERS-ONLY COMPONENTS ---

const AuthPage = ({ onSignIn, onSignUp, users, approvedMatricNumbers }) => {
    const [isSignUp, setIsSignUp] = useState(false);
    return (
        <div className="auth-page-wrapper">
            <div className="auth-page-container">
                <div className="auth-header">
                    <h1 className="logo">LAUTECH Economics '29</h1>
                    <h2>Community Portal</h2>
                </div>
                {isSignUp ? (
                    <SignUpForm onSignUp={onSignUp} users={users} approvedMatricNumbers={approvedMatricNumbers} />
                ) : (
                    <SignInForm onSignIn={onSignIn} users={users} />
                )}
                <p className="auth-switch">
                    {isSignUp ? 'Already have an account?' : "Don't have an account?"}{' '}
                    <a href="#" onClick={(e) => { e.preventDefault(); setIsSignUp(!isSignUp); }}>
                        {isSignUp ? 'Sign In' : 'Sign Up'}
                    </a>
                </p>
            </div>
        </div>
    );
};

const SignUpForm = ({ onSignUp, users, approvedMatricNumbers }) => {
    const [formData, setFormData] = useState({ firstName: '', otherName: '', surname: '', username: '', email: '', matricNumber: '', password: '' });
    const [error, setError] = useState('');

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value.trim() }));
    };

    const handleSignUp = (e) => {
        e.preventDefault();
        setError('');

        if (!approvedMatricNumbers.includes(formData.matricNumber)) {
            setError('This matric number is not on the approved list. Please contact your administrator.');
            return;
        }
        if (users.some(user => user.matricNumber === formData.matricNumber)) {
            setError('This matric number has already been registered.');
            return;
        }
        if (users.some(user => user.email === formData.email)) {
            setError('This email address is already in use.');
            return;
        }
        if (users.some(user => user.username === formData.username)) {
            setError('This username is already taken.');
            return;
        }

        onSignUp(formData);
    };

    return (
        <div className="card auth-card">
            <h3 className="auth-title">Create Account</h3>
            <form onSubmit={handleSignUp} className="auth-form">
                {error && <p className="error-message">{error}</p>}
                <div className="form-group"><label htmlFor="firstName">First Name</label><input type="text" id="firstName" name="firstName" value={formData.firstName} onChange={handleChange} required /></div>
                <div className="form-group"><label htmlFor="otherName">Other Name</label><input type="text" id="otherName" name="otherName" value={formData.otherName} onChange={handleChange} /></div>
                <div className="form-group"><label htmlFor="surname">Surname</label><input type="text" id="surname" name="surname" value={formData.surname} onChange={handleChange} required /></div>
                <div className="form-group"><label htmlFor="username">Username</label><input type="text" id="username" name="username" value={formData.username} onChange={handleChange} required /></div>
                <div className="form-group"><label htmlFor="email">Email Address</label><input type="email" id="email" name="email" value={formData.email} onChange={handleChange} required /></div>
                <div className="form-group"><label htmlFor="matricNumber">Matric Number</label><input type="text" id="matricNumber" name="matricNumber" value={formData.matricNumber} onChange={handleChange} required /></div>
                <div className="form-group"><label htmlFor="password">Password</label><input type="password" id="password" name="password" value={formData.password} onChange={handleChange} required /></div>
                <button type="submit" className="btn-primary">Sign Up</button>
            </form>
        </div>
    );
};

const SignInForm = ({ onSignIn, users }) => {
    const [formData, setFormData] = useState({ matricNumber: '', password: '' });
    const [error, setError] = useState('');

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSignIn = (e) => {
        e.preventDefault();
        setError('');
        const user = users.find(u => u.matricNumber === formData.matricNumber && u.password === formData.password);
        if (user) {
            if (user.status === 'banned' || user.status === 'suspended') {
                 setError(`Your account has been ${user.status}. Please contact an administrator.`);
                 return;
            }
            onSignIn(user);
        } else {
            setError('Invalid matric number or password.');
        }
    };

    return (
        <div className="card auth-card">
            <h3 className="auth-title">Sign In</h3>
            <form onSubmit={handleSignIn} className="auth-form">
                {error && <p className="error-message">{error}</p>}
                <div className="form-group"><label htmlFor="matricNumber">Matric Number</label><input type="text" id="matricNumber" name="matricNumber" value={formData.matricNumber} onChange={handleChange} required /></div>
                <div className="form-group"><label htmlFor="password">Password</label><input type="password" id="password" name="password" value={formData.password} onChange={handleChange} required /></div>
                <button type="submit" className="btn-primary">Sign In</button>
            </form>
        </div>
    );
};

const ProfilePage = ({ currentUser, onProfileUpdate }) => {
    const [isEditing, setIsEditing] = useState(false);
    const [formData, setFormData] = useState({ username: currentUser.username });
    const [profilePicture, setProfilePicture] = useState(currentUser.profilePicture || null);

    const handleFileChange = (e) => {
        if (e.target.files && e.target.files[0]) {
            const reader = new FileReader();
            reader.onload = (event) => {
                setProfilePicture(event.target.result);
            };
            reader.readAsDataURL(e.target.files[0]);
        }
    };

    const handleSave = () => {
        onProfileUpdate({ ...formData, profilePicture });
        setIsEditing(false);
    };

    return (
    <div className="page-container">
        <div className="container auth-container">
            <h1 className="page-title">My Profile</h1>
            <div className="card profile-card">
                <div className="profile-header">
                    <div className="profile-pic-container">
                         <img src={profilePicture || `https://api.dicebear.com/7.x/initials/svg?seed=${currentUser.fullName}`} alt="Profile" className="profile-pic" />
                         {isEditing && <input type="file" accept="image/*" onChange={handleFileChange} />}
                    </div>
                    <div>
                        <h2>{currentUser.fullName}</h2>
                        <p><strong>Matric No:</strong> {currentUser.matricNumber}</p>
                        <p><strong>Role:</strong> <span className={`role-badge ${currentUser.role.toLowerCase().replace(/[\s_]/g, '-')}`}>{currentUser.role}</span></p>
                    </div>
                </div>

                <hr />
                
                {isEditing ? (
                    <div className="profile-edit-form">
                        <div className="form-group">
                            <label htmlFor="username">Username</label>
                            <input type="text" id="username" value={formData.username} onChange={e => setFormData({...formData, username: e.target.value})} />
                        </div>
                        <div className="profile-edit-actions">
                            <button className="btn-tertiary" onClick={() => setIsEditing(false)}>Cancel</button>
                            <button className="btn-secondary" onClick={handleSave}>Save Changes</button>
                        </div>
                    </div>
                ) : (
                    <div className="profile-details">
                        <p><strong>Username:</strong> {currentUser.username}</p>
                        <p><strong>Email:</strong> {currentUser.email}</p>
                        <button className="btn-edit-profile" onClick={() => setIsEditing(true)}>Edit Profile</button>
                    </div>
                )}
            </div>
        </div>
    </div>
)};

const AdminPage = ({ users, onRoleChange, approvedMatricNumbers, onAddMatricNumber, onUserStatusChange }) => {
    const [newMatric, setNewMatric] = useState('');
    const [roleEdits, setRoleEdits] = useState({});
    
    const sortedUsers = [...users].sort((a, b) => {
        const aIsAdmin = a.role === 'Class President' || a.role === 'Admin';
        const bIsAdmin = b.role === 'Class President' || b.role === 'Admin';
        if (aIsAdmin && !bIsAdmin) return -1;
        if (!aIsAdmin && bIsAdmin) return 1;
        return a.fullName.localeCompare(b.fullName);
    });

    const handleRoleInputChange = (userId, value) => {
        setRoleEdits(prev => ({ ...prev, [userId]: value }));
    };

    const handleRoleSave = (userId) => {
        if (roleEdits[userId]) {
            onRoleChange(userId, roleEdits[userId]);
            setRoleEdits(prev => {
                const newState = { ...prev };
                delete newState[userId];
                return newState;
            });
        }
    };
    
    const handleAddMatricSubmit = (e) => {
        e.preventDefault();
        if(newMatric.trim()){
            onAddMatricNumber(newMatric.trim());
            setNewMatric('');
        }
    };

    return (
        <div className="page-container">
            <div className="container">
                <h1 className="page-title">Admin Dashboard</h1>
                <p className="page-subtitle">Manage users, roles, and access for the department.</p>

                <div className="card admin-card">
                    <h3>Add Approved Matriculation Number</h3>
                    <form onSubmit={handleAddMatricSubmit} className="admin-form">
                        <input 
                            type="text" 
                            value={newMatric} 
                            onChange={(e) => setNewMatric(e.target.value)}
                            placeholder="Enter new matric number"
                        />
                        <button type="submit" className="btn-secondary">Add Number</button>
                    </form>
                    <p>Current approved numbers: {approvedMatricNumbers.length}</p>
                </div>

                <div className="card admin-card">
                    <h3>Manage Users</h3>
                    <div className="table-container">
                        <table className="user-table">
                            <thead>
                                <tr><th>Full Name</th><th>Role</th><th>Status</th><th>Actions</th></tr>
                            </thead>
                            <tbody>
                                {sortedUsers.map(user => (
                                    <tr key={user.id}>
                                        <td>
                                            {user.fullName}
                                            {(user.role === 'Admin' || user.role === 'Class President') && <span className="admin-badge">Admin</span>}
                                        </td>
                                        <td className="role-management-cell">
                                            <input
                                                className="role-input"
                                                type="text"
                                                defaultValue={user.role}
                                                onChange={(e) => handleRoleInputChange(user.id, e.target.value)}
                                                onBlur={() => handleRoleSave(user.id)}
                                                disabled={user.role === 'Class President'}
                                            />
                                        </td>
                                        <td><span className={`status-badge status-${user.status || 'active'}`}>{user.status || 'Active'}</span></td>
                                        <td className="user-actions-cell">
                                            {user.role !== 'Class President' && (
                                                <>
                                                    <button onClick={() => onUserStatusChange(user.id, user.status === 'suspended' ? 'active' : 'suspended')} className={`btn-user-action ${user.status === 'suspended' ? 'btn-un-action' : 'btn-suspend'}`}>
                                                        {user.status === 'suspended' ? 'Unsuspend' : 'Suspend'}
                                                    </button>
                                                    <button onClick={() => onUserStatusChange(user.id, user.status === 'banned' ? 'active' : 'banned')} className={`btn-user-action ${user.status === 'banned' ? 'btn-un-action' : 'btn-ban'}`}>
                                                        {user.status === 'banned' ? 'Unban' : 'Ban'}
                                                    </button>
                                                </>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
};


// --- PAGE COMPONENTS ---

const HomePage = ({ setRoute, currentUser, announcements, faculty }) => (
    <>
        <Hero currentUser={currentUser} />
        <section id="announcements-preview" className="content-section">
            <div className="container">
                <h2>Latest Announcements</h2>
                <div className="card-grid">
                    {announcements.slice(0, 3).map((item) => (
                        <div className="card" key={item.id}>
                            <h3>{item.title}</h3>
                            <p className="date">{item.date}</p>
                            <p>{item.excerpt.substring(0, 100)}...</p>
                        </div>
                    ))}
                     {announcements.length === 0 && <p>No announcements yet.</p>}
                </div>
                <div className="view-all-wrapper">
                    <button onClick={() => setRoute({page: 'announcements'})} className="btn-secondary">View All Announcements</button>
                </div>
            </div>
        </section>
        {faculty.length > 0 && (
            <section id="faculty-preview" className="content-section alt-bg">
                <div className="container">
                    <h2>Featured Faculty</h2>
                    <div className="card-grid">
                        {faculty.slice(0, 3).map((person, index) => (
                            <div className="card faculty-card" key={person.id || index}>
                                <div className="faculty-avatar"></div>
                                <h3>{person.name}</h3>
                                <p className="title">{person.title}</p>
                                <p className="area">{person.area}</p>
                            </div>
                        ))}
                    </div>
                    <div className="view-all-wrapper">
                        <button onClick={() => setRoute({page: 'faculty'})} className="btn-secondary">Meet All Faculty</button>
                    </div>
                </div>
            </section>
        )}
    </>
);

const AnnouncementsPage = ({ announcements, currentUser, onAddAnnouncement }) => {
    const [showForm, setShowForm] = useState(false);
    const [formData, setFormData] = useState({ title: '', excerpt: '' });

    const isAdmin = currentUser.role === 'Class President' || currentUser.role === 'Admin';
    
    const handleChange = (e) => {
        setFormData({...formData, [e.target.name]: e.target.value});
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (formData.title.trim() && formData.excerpt.trim()) {
            onAddAnnouncement(formData);
            setFormData({ title: '', excerpt: '' });
            setShowForm(false);
        }
    };

    return (
        <div className="page-container">
            <div className="container">
                <h1 className="page-title">Announcements</h1>
                <p className="page-subtitle">Stay up-to-date with the latest news and events from the Department of Economics.</p>
                
                {isAdmin && (
                    <div className="card announcement-form-container">
                        {!showForm ? (
                            <button className="btn-secondary" onClick={() => setShowForm(true)}>+ Create New Announcement</button>
                        ) : (
                             <form onSubmit={handleSubmit}>
                                <h3>New Announcement</h3>
                                <div className="form-group"><label htmlFor="title">Title</label><input type="text" id="title" name="title" value={formData.title} onChange={handleChange} required /></div>
                                <div className="form-group"><label htmlFor="excerpt">Content</label><textarea id="excerpt" name="excerpt" value={formData.excerpt} rows="4" onChange={handleChange} required></textarea></div>
                                <div className="form-actions">
                                    <button type="button" className="btn-tertiary" onClick={() => setShowForm(false)}>Cancel</button>
                                    <button type="submit" className="btn-generate">Post</button>
                                </div>
                            </form>
                        )}
                    </div>
                )}

                {announcements.length > 0 ? (
                    <div className="card-grid">
                        {announcements.map((item) => (
                            <div className="card" key={item.id}>
                                <h3>{item.title}</h3>
                                <p className="date">{item.date}</p>
                                <p>{item.excerpt}</p>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="empty-state">
                        <p>No announcements have been posted yet.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

const FacultyPage = ({ faculty, currentUser, onAddFaculty }) => {
    const [showForm, setShowForm] = useState(false);
    const [formData, setFormData] = useState({ name: '', title: '', area: '' });

    const isAdmin = currentUser.role === 'Class President' || currentUser.role === 'Admin';

    const handleChange = (e) => {
        setFormData({...formData, [e.target.name]: e.target.value});
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (formData.name.trim() && formData.title.trim() && formData.area.trim()) {
            onAddFaculty(formData);
            setFormData({ name: '', title: '', area: '' });
            setShowForm(false);
        }
    };

    return (
        <div className="page-container">
            <div className="container">
                <h1 className="page-title">Our Faculty</h1>
                <p className="page-subtitle">Meet the talented team shaping the future of economics.</p>
                
                {isAdmin && (
                    <div className="card announcement-form-container">
                        {!showForm ? (
                            <button className="btn-secondary" onClick={() => setShowForm(true)}>+ Add New Faculty</button>
                        ) : (
                            <form onSubmit={handleSubmit}>
                                <h3>New Faculty Profile</h3>
                                <div className="form-group"><label htmlFor="name">Full Name</label><input type="text" id="name" name="name" value={formData.name} onChange={handleChange} required /></div>
                                <div className="form-group"><label htmlFor="title">Title</label><input type="text" id="title" name="title" value={formData.title} onChange={handleChange} required /></div>
                                <div className="form-group"><label htmlFor="area">Area of Specialization</label><input type="text" id="area" name="area" value={formData.area} onChange={handleChange} required /></div>
                                <div className="form-actions">
                                    <button type="button" className="btn-tertiary" onClick={() => setShowForm(false)}>Cancel</button>
                                    <button type="submit" className="btn-generate">Add Faculty</button>
                                </div>
                            </form>
                        )}
                    </div>
                )}
                
                {faculty.length > 0 ? (
                    <div className="card-grid">
                        {faculty.map((person, index) => (
                            <div className="card faculty-card" key={person.id || index}>
                                <div className="faculty-avatar"></div>
                                <h3>{person.name}</h3>
                                <p className="title">{person.title}</p>
                                <p className="area">{person.area}</p>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="empty-state">
                         <p>No faculty profiles have been added yet.</p>
                    </div>
                )}
            </div>
        </div>
    );
};


const CoursesPage = ({ courses, currentUser, onCourseUpdate }) => {
    const isAdmin = currentUser.role === 'Class President' || currentUser.role === 'Admin';
    const [editingCourseId, setEditingCourseId] = useState(null);
    const [courseData, setCourseData] = useState({ code: '', title: '', units: '' });
    const [activeLevel, setActiveLevel] = useState(Object.keys(courses)[0]);

    const handleEdit = (course) => {
        setEditingCourseId(course.id);
        setCourseData({ code: course.code, title: course.title, units: course.units });
    };

    const handleCancel = () => {
        setEditingCourseId(null);
    };

    const handleSave = (level, semester, courseId) => {
        onCourseUpdate(level, semester, courseId, courseData);
        setEditingCourseId(null);
    };
    
    const handleChange = (e) => {
        setCourseData({...courseData, [e.target.name]: e.target.value });
    }
    
    const levelSemesters = courses[activeLevel] || {};

    return (
        <div className="page-container">
            <div className="container">
                <h1 className="page-title">Course Catalog</h1>
                <p className="page-subtitle">Department of Economics – Full Course List (100–400 Level)</p>
                <div className="courses-content">
                    <div className="course-level-tabs">
                        {Object.keys(courses).map(level => (
                            <button 
                                key={level} 
                                className={`level-tab ${activeLevel === level ? 'active' : ''}`}
                                onClick={() => setActiveLevel(level)}
                            >
                                {level}
                            </button>
                        ))}
                    </div>
                    
                    <section className="course-level-section">
                        <div className="course-semesters-grid">
                            {Object.entries(levelSemesters).map(([semester, semesterCourses]) => (
                                <div key={semester} className="course-semester-section">
                                    <h3 className="course-semester-title">{semester}</h3>
                                    <ul className="course-list">
                                        {Array.isArray(semesterCourses) && semesterCourses.map(course => (
                                            <li key={course.id} className="course-item">
                                                {editingCourseId === course.id ? (
                                                    <div className="course-edit-form">
                                                        <input type="text" name="code" value={courseData.code} onChange={handleChange} placeholder="Code"/>
                                                        <input type="text" name="title" value={courseData.title} onChange={handleChange} placeholder="Title"/>
                                                        <input type="text" name="units" value={courseData.units} onChange={handleChange} placeholder="Units"/>
                                                        <div className="course-edit-actions">
                                                            <button onClick={() => handleSave(activeLevel, semester, course.id)}>Save</button>
                                                            <button onClick={handleCancel}>Cancel</button>
                                                        </div>
                                                    </div>
                                                ) : (
                                                    <>
                                                        <span className="course-code">{course.code}</span>
                                                        <span className="course-title">{course.title}</span>
                                                        <span className="course-units">{course.units}</span>
                                                        {isAdmin && <button className="btn-edit" onClick={() => handleEdit(course)}>Edit</button>}
                                                    </>
                                                )}
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            ))}
                        </div>
                    </section>
                </div>
            </div>
        </div>
    );
};

const DocumentsPage = ({ documents, currentUser, onAddDocument }) => {
    const [isDragging, setIsDragging] = useState(false);
    const [customName, setCustomName] = useState('');
    const [file, setFile] = useState(null);
    
    const isAdmin = currentUser.role === 'Class President' || currentUser.role === 'Admin';

    const handleFileSelect = (selectedFile) => {
        if (selectedFile) {
            setFile(selectedFile);
            if (!customName) {
                setCustomName(selectedFile.name.replace(/\.[^/.]+$/, ""));
            }
        }
    };
    
    const handleSubmit = (e) => {
        e.preventDefault();
        if(file) {
            onAddDocument({ file, customName });
            setFile(null);
            setCustomName('');
        } else {
            alert("Please select a file first.");
        }
    }

    const handleDragEvents = (e, dragging) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(dragging);
    };

    const handleDrop = (e) => {
        handleDragEvents(e, false);
        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            handleFileSelect(e.dataTransfer.files[0]);
        }
    };
    
    const handleView = (doc) => {
        const newWindow = window.open();
        newWindow.document.write(`<iframe src="${doc.data}" frameborder="0" style="border:0; top:0px; left:0px; bottom:0px; right:0px; width:100%; height:100%;" allowfullscreen></iframe>`);
        newWindow.document.title = doc.name;
    }
    
    return (
        <div className="page-container">
            <div className="container">
                <h1 className="page-title">Documents</h1>
                <p className="page-subtitle">Shared resources and documents for the class.</p>
                
                {isAdmin && (
                    <div className="card admin-card">
                        <h3>Upload New Document</h3>
                        <form onSubmit={handleSubmit} className="document-upload-form">
                             <div 
                                className={`upload-area ${isDragging ? 'dragging' : ''}`}
                                onDragEnter={(e) => handleDragEvents(e, true)}
                                onDragLeave={(e) => handleDragEvents(e, false)}
                                onDragOver={(e) => handleDragEvents(e, true)}
                                onDrop={handleDrop}
                            >
                                <input type="file" id="file-upload" onChange={(e) => handleFileSelect(e.target.files[0])} className="upload-input" />
                                <label htmlFor="file-upload" className="upload-label">
                                    {file ? <p>Selected: {file.name}</p> : <p>Drag & Drop a file here</p>}
                                    <p>or</p>
                                    <span className="btn-tertiary">Browse Files</span>
                                </label>
                            </div>
                            <div className="form-group">
                                <label htmlFor="customName">Document Name</label>
                                <input type="text" id="customName" value={customName} onChange={(e) => setCustomName(e.target.value)} placeholder="Enter a name for the document" required/>
                            </div>
                            <button type="submit" className="btn-secondary">Upload</button>
                        </form>
                    </div>
                )}
                
                <div className="card">
                    <h3>Available Documents</h3>
                    {documents.length > 0 ? (
                        <ul className="document-list">
                            {documents.map(doc => (
                                <li key={doc.id} className="document-item">
                                    <span className="document-name">{doc.name}</span>
                                    <div className="document-actions">
                                      <button onClick={() => handleView(doc)} className="btn-view">View</button>
                                      <a href={doc.data} download={doc.name} className="btn-download">Download</a>
                                    </div>
                                </li>
                            ))}
                        </ul>
                    ) : (
                        <p>No documents have been uploaded yet.</p>
                    )}
                </div>
            </div>
        </div>
    );
};

const QuizzesPage = ({ quizzes, currentUser, setRoute, onDeleteQuiz }) => {
    const isAdmin = currentUser.role === 'Class President' || currentUser.role === 'Admin';
    return (
        <div className="page-container">
            <div className="container">
                <h1 className="page-title">Quizzes</h1>
                <p className="page-subtitle">Test your knowledge with these quizzes.</p>
                {isAdmin && (
                    <div className="admin-actions">
                        <button className="btn-secondary" onClick={() => setRoute({ page: 'createQuiz' })}>+ Create New Quiz</button>
                    </div>
                )}
                <div className="quiz-list">
                    {quizzes.length > 0 ? (
                        quizzes.map(quiz => (
                            <div className="card quiz-card" key={quiz.id}>
                                <div className="quiz-info">
                                    <h3>{quiz.title}</h3>
                                    <p>{quiz.questions.length} Questions | Type: {quiz.type.toUpperCase()}</p>
                                </div>
                                <div className="quiz-actions">
                                    <button className="btn-primary" onClick={() => setRoute({ page: 'takeQuiz', quizId: quiz.id })}>Take Quiz</button>
                                    {isAdmin && <button className="btn-danger" onClick={() => onDeleteQuiz(quiz.id)}>Delete</button>}
                                </div>
                            </div>
                        ))
                    ) : (
                         <div className="empty-state">
                            <p>No quizzes are available at the moment.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
};

const CreateQuizPage = ({ setRoute, onCreateQuiz }) => {
    const [title, setTitle] = useState('');
    const [type, setType] = useState('mcq');
    const [questions, setQuestions] = useState([{ text: '', image: null, options: ['', '', '', ''], correctAnswerIndex: 0, modelAnswer: '' }]);

    const handleQuestionChange = (index, field, value) => {
        const newQuestions = [...questions];
        newQuestions[index][field] = value;
        setQuestions(newQuestions);
    };

    const handleOptionChange = (qIndex, oIndex, value) => {
        const newQuestions = [...questions];
        newQuestions[qIndex].options[oIndex] = value;
        setQuestions(newQuestions);
    };
    
    const handleCorrectAnswerChange = (qIndex, oIndex) => {
        const newQuestions = [...questions];
        newQuestions[qIndex].correctAnswerIndex = oIndex;
        setQuestions(newQuestions);
    };

    const handleImageChange = (index, file) => {
        if (file) {
            const reader = new FileReader();
            reader.onload = (e) => {
                handleQuestionChange(index, 'image', e.target.result);
            };
            reader.readAsDataURL(file);
        }
    };

    const addQuestion = () => {
        if (type === 'mcq') {
            setQuestions([...questions, { text: '', image: null, options: ['', '', '', ''], correctAnswerIndex: 0, modelAnswer: '' }]);
        } else {
            setQuestions([...questions, { text: '', image: null, modelAnswer: '' }]);
        }
    };
    
    const removeQuestion = (index) => {
        const newQuestions = questions.filter((_, i) => i !== index);
        setQuestions(newQuestions);
    }
    
    const handleSubmit = (e) => {
        e.preventDefault();
        const finalQuiz = { title, type, questions };
        onCreateQuiz(finalQuiz);
    }

    return (
        <div className="page-container">
            <div className="container">
                <h1 className="page-title">Create a New Quiz</h1>
                <form className="card create-quiz-form" onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label>Quiz Title</label>
                        <input type="text" value={title} onChange={e => setTitle(e.target.value)} required />
                    </div>
                    <div className="form-group">
                        <label>Quiz Type</label>
                        <select value={type} onChange={e => { setType(e.target.value); setQuestions([{ text: '', image: null, options: ['', '', '', ''], correctAnswerIndex: 0, modelAnswer: '' }])}}>
                            <option value="mcq">Multiple Choice</option>
                            <option value="theory">Theory</option>
                        </select>
                    </div>
                    <hr/>
                    {questions.map((q, qIndex) => (
                        <div key={qIndex} className="question-editor">
                            <h4>Question {qIndex + 1}</h4>
                            <textarea placeholder="Enter question text..." value={q.text} onChange={e => handleQuestionChange(qIndex, 'text', e.target.value)} required></textarea>
                            <div className="form-group">
                                <label>Optional Image</label>
                                <input type="file" accept="image/*" onChange={e => handleImageChange(qIndex, e.target.files[0])} />
                                {q.image && <img src={q.image} alt="Question preview" className="quiz-image-preview" />}
                            </div>
                            {type === 'mcq' && (
                                <div className="options-editor">
                                    <label>Options (select the correct answer)</label>
                                    {q.options.map((opt, oIndex) => (
                                        <div key={oIndex} className="option-input">
                                            <input type="radio" name={`correct_q${qIndex}`} checked={q.correctAnswerIndex === oIndex} onChange={() => handleCorrectAnswerChange(qIndex, oIndex)}/>
                                            <input type="text" placeholder={`Option ${oIndex + 1}`} value={opt} onChange={e => handleOptionChange(qIndex, oIndex, e.target.value)} required/>
                                        </div>
                                    ))}
                                </div>
                            )}
                             {type === 'theory' && (
                                <div className="form-group">
                                    <label>Model Answer</label>
                                    <textarea placeholder="Enter the model answer..." value={q.modelAnswer} onChange={e => handleQuestionChange(qIndex, 'modelAnswer', e.target.value)} required></textarea>
                                </div>
                            )}
                             <button type="button" className="btn-danger-text" onClick={() => removeQuestion(qIndex)}>Remove Question</button>
                        </div>
                    ))}
                    <div className="quiz-form-actions">
                       <button type="button" className="btn-tertiary" onClick={addQuestion}>+ Add Question</button>
                       <div>
                           <button type="button" className="btn-tertiary" onClick={() => setRoute({ page: 'quizzes' })}>Cancel</button>
                           <button type="submit" className="btn-secondary">Create Quiz</button>
                       </div>
                    </div>
                </form>
            </div>
        </div>
    );
};


const TakeQuizPage = ({ quiz, onSubmit, currentUser }) => {
    const [answers, setAnswers] = useState({});

    const handleAnswerChange = (questionIndex, answer) => {
        setAnswers(prev => ({ ...prev, [questionIndex]: answer }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        onSubmit(quiz.id, answers, currentUser.id);
    };

    return (
        <div className="page-container">
            <div className="container">
                <h1 className="page-title">{quiz.title}</h1>
                <form className="card take-quiz-form" onSubmit={handleSubmit}>
                    {quiz.questions.map((q, qIndex) => (
                        <div key={qIndex} className="quiz-question-block">
                            <p className="question-text">{qIndex + 1}. {q.text}</p>
                            {q.image && <img src={q.image} alt="Question" className="quiz-image-display" />}
                            {quiz.type === 'mcq' ? (
                                <div className="quiz-options">
                                    {q.options.map((opt, oIndex) => (
                                        <label key={oIndex} className="quiz-option-label">
                                            <input
                                                type="radio"
                                                name={`q_${qIndex}`}
                                                value={oIndex}
                                                onChange={() => handleAnswerChange(qIndex, oIndex)}
                                                checked={answers[qIndex] === oIndex}
                                                required
                                            />
                                            {opt}
                                        </label>
                                    ))}
                                </div>
                            ) : (
                                <textarea
                                    className="quiz-theory-answer"
                                    placeholder="Your answer..."
                                    onChange={(e) => handleAnswerChange(qIndex, e.target.value)}
                                    value={answers[qIndex] || ''}
                                    required
                                ></textarea>
                            )}
                        </div>
                    ))}
                    <button type="submit" className="btn-primary">Submit Quiz</button>
                </form>
            </div>
        </div>
    );
};

const QuizResultsPage = ({ quiz, submission, setRoute }) => {
    let score = 0;
    if (quiz.type === 'mcq') {
        quiz.questions.forEach((q, index) => {
            if (submission.answers[index] === q.correctAnswerIndex) {
                score++;
            }
        });
    }

    return (
        <div className="page-container">
            <div className="container">
                <h1 className="page-title">Quiz Results: {quiz.title}</h1>
                {quiz.type === 'mcq' && (
                    <div className="card score-card">
                        <h2>Your Score: {score} / {quiz.questions.length}</h2>
                    </div>
                )}
                <div className="card results-breakdown">
                    <h3>Review Your Answers</h3>
                    {quiz.questions.map((q, qIndex) => (
                        <div key={qIndex} className="result-question-block">
                            <p className="question-text">{qIndex + 1}. {q.text}</p>
                             {q.image && <img src={q.image} alt="Question" className="quiz-image-display" />}
                            {quiz.type === 'mcq' ? (
                                <div className="result-options">
                                    {q.options.map((opt, oIndex) => {
                                        const isCorrect = oIndex === q.correctAnswerIndex;
                                        const isUserAnswer = submission.answers[qIndex] === oIndex;
                                        let className = 'result-option';
                                        if (isCorrect) className += ' correct';
                                        if (isUserAnswer && !isCorrect) className += ' incorrect';
                                        
                                        return (
                                            <div key={oIndex} className={className}>
                                                {isUserAnswer && <span className="your-answer-indicator">{isCorrect ? '✔' : '✖'}</span>}
                                                {opt}
                                            </div>
                                        );
                                    })}
                                </div>
                            ) : (
                                <div className="theory-result">
                                    <h4>Your Answer:</h4>
                                    <p className="user-answer-text">{submission.answers[qIndex]}</p>
                                    <h4>Model Answer:</h4>
                                    <p className="model-answer-text">{q.modelAnswer}</p>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
                 <div className="view-all-wrapper">
                    <button onClick={() => setRoute({page: 'quizzes'})} className="btn-secondary">Back to Quizzes</button>
                </div>
            </div>
        </div>
    );
};

const MembersPage = ({ users, currentUser, setRoute }) => {
    return (
        <div className="page-container">
            <div className="container">
                <h1 className="page-title">Class Members</h1>
                <p className="page-subtitle">Connect with your classmates in the Department of Economics.</p>
                 <div className="card-grid">
                    {users.map(user => (
                        <div key={user.id} className="card member-card">
                            <img src={user.profilePicture || `https://api.dicebear.com/7.x/initials/svg?seed=${user.fullName}`} alt={user.fullName} className="member-avatar" />
                            <div className="member-info">
                                <h3>{user.fullName}</h3>
                                <p>@{user.username}</p>
                                <span className={`role-badge ${user.role.toLowerCase().replace(/[\s_]/g, '-')}`}>{user.role}</span>
                            </div>
                            {user.id !== currentUser.id && (
                                <button className="btn-secondary btn-message" onClick={() => setRoute({ page: 'chat', withUserId: user.id })}>
                                    Message
                                </button>
                            )}
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

const MessagesPage = ({ messages, users, currentUser, setRoute, groups }) => {
    // 1. Process Direct Messages
    const dmConversations = Object.values(messages.reduce((acc, msg) => {
        if (msg.groupId) return acc; // Skip group messages
        const otherUserId = msg.from === currentUser.id ? msg.to : msg.from;
        if (!otherUserId) return acc;
        
        if (!acc[otherUserId] || acc[otherUserId].lastMessage.timestamp < msg.timestamp) {
            const otherUser = users.find(u => u.id === otherUserId);
            if (otherUser) {
                acc[otherUserId] = {
                    user: otherUser,
                    lastMessage: msg,
                };
            }
        }
        return acc;
    }, {}));

    // 2. Process Group Chats
    const userGroups = groups.filter(g => g.members.includes(currentUser.id));
    const groupConversations = userGroups.map(group => {
        const lastMessage = messages
            .filter(msg => msg.groupId === group.id)
            .sort((a, b) => b.timestamp - a.timestamp)[0];
        
        return {
            group,
            lastMessage: lastMessage || { text: 'No messages yet', timestamp: group.id } // Use group ID for timestamp if no messages
        };
    });

    // 3. Combine and Sort
    const allConversations = [
        ...dmConversations.map(c => ({ ...c, type: 'dm' })),
        ...groupConversations.map(c => ({ ...c, type: 'group' }))
    ].sort((a, b) => b.lastMessage.timestamp - a.lastMessage.timestamp);

    const formatTime = (timestamp) => {
        if (typeof timestamp !== 'number' || timestamp === 0) return '';
        const date = new Date(timestamp);
        return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    }

    return (
        <div className="page-container">
            <div className="container">
                <div className="page-header-with-action">
                    <div>
                        <h1 className="page-title">Messages</h1>
                        <p className="page-subtitle">Your recent conversations.</p>
                    </div>
                    <button className="btn-secondary" onClick={() => setRoute({ page: 'createGroup' })}>+ Create Group</button>
                </div>
                <div className="card">
                    {allConversations.length > 0 ? (
                        <ul className="conversations-list">
                            {allConversations.map((convo) => {
                                const key = convo.type === 'dm' ? convo.user.id : convo.group.id;
                                const lastMessageText = convo.lastMessage.text || 'No messages yet';
                                const senderPrefix = convo.lastMessage.from === currentUser.id ? 'You: ' : '';

                                return (
                                    <li 
                                        key={key} 
                                        className="conversation-item" 
                                        onClick={() => setRoute(convo.type === 'dm' 
                                            ? { page: 'chat', withUserId: convo.user.id }
                                            : { page: 'chat', withGroupId: convo.group.id })}
                                    >
                                        {convo.type === 'dm' ? (
                                            <img src={convo.user.profilePicture || `https://api.dicebear.com/7.x/initials/svg?seed=${convo.user.fullName}`} alt={convo.user.fullName} className="convo-avatar" />
                                        ) : (
                                            <div className="convo-avatar group-avatar">
                                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path d="M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5c-1.66 0-3 1.34-3 3s1.34 3 3 3zm-8 0c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5C6.34 5 5 6.34 5 8s1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5c0-2.33-4.67-3.5-7-3.5zm8 0c-.29 0-.62.02-.97.05 1.16.84 1.97 1.97 1.97 3.45V19h6v-2.5c0-2.33-4.67-3.5-7-3.5z"/></svg>
                                            </div>
                                        )}
                                        <div className="convo-details">
                                            <h4>{convo.type === 'dm' ? convo.user.fullName : convo.group.name}</h4>
                                            <p className="last-message-preview">
                                                {senderPrefix}{lastMessageText.substring(0, 40)}{lastMessageText.length > 40 ? '...' : ''}
                                            </p>
                                        </div>
                                        <span className="convo-time">{formatTime(convo.lastMessage.timestamp)}</span>
                                    </li>
                                );
                            })}
                        </ul>
                    ) : (
                        <div className="empty-state">
                            <p>You have no messages yet. Start a conversation from the Members page or create a group.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

const CreateGroupPage = ({ users, currentUser, onCreateGroup, setRoute }) => {
    const [name, setName] = useState('');
    const [selectedMembers, setSelectedMembers] = useState({});

    const handleMemberToggle = (userId) => {
        setSelectedMembers(prev => ({
            ...prev,
            [userId]: !prev[userId]
        }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        const memberIds = Object.keys(selectedMembers).filter(id => selectedMembers[id]);
        if (name.trim() && memberIds.length > 0) {
            onCreateGroup({
                name: name.trim(),
                memberIds: [...memberIds.map(id => parseInt(id)), currentUser.id] // Creator is always a member
            });
        } else {
            alert('Please provide a group name and select at least one member.');
        }
    };
    
    return (
        <div className="page-container">
            <div className="container">
                <h1 className="page-title">Create a New Group</h1>
                <p className="page-subtitle">Start a conversation with multiple classmates.</p>
                <form className="card create-group-form" onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label htmlFor="group-name">Group Name</label>
                        <input type="text" id="group-name" value={name} onChange={e => setName(e.target.value)} required />
                    </div>
                     <div className="form-group">
                        <label>Select Members</label>
                        <ul className="member-selection-list">
                            {users.filter(u => u.id !== currentUser.id).map(user => (
                                <li key={user.id} className="member-selection-item">
                                    <input 
                                        type="checkbox" 
                                        id={`member-${user.id}`} 
                                        checked={!!selectedMembers[user.id]}
                                        onChange={() => handleMemberToggle(user.id)}
                                    />
                                    <label htmlFor={`member-${user.id}`}>
                                        <img src={user.profilePicture || `https://api.dicebear.com/7.x/initials/svg?seed=${user.fullName}`} alt={user.fullName} />
                                        <span>{user.fullName}</span>
                                    </label>
                                </li>
                            ))}
                        </ul>
                    </div>
                    <div className="form-actions">
                        <button type="button" className="btn-tertiary" onClick={() => setRoute({ page: 'messages' })}>Cancel</button>
                        <button type="submit" className="btn-secondary">Create Group</button>
                    </div>
                </form>
            </div>
        </div>
    );
};


const ChatPage = ({ messages, users, currentUser, withUserId, withGroupId, onSendMessage, setRoute, groups }) => {
    const isGroupChat = !!withGroupId;
    const otherUser = !isGroupChat ? users.find(u => u.id === withUserId) : null;
    const group = isGroupChat ? groups.find(g => g.id === withGroupId) : null;

    const [newMessage, setNewMessage] = useState('');
    const chatBodyRef = useRef(null);
    const textareaRef = useRef(null);

    const chatTarget = isGroupChat ? group : otherUser;

    const chatMessages = messages
        .filter(msg => {
            if (isGroupChat) {
                return msg.groupId === withGroupId;
            }
            return (msg.from === currentUser.id && msg.to === withUserId) || (msg.from === withUserId && msg.to === currentUser.id);
        })
        .sort((a, b) => a.timestamp - b.timestamp);
    
    useEffect(() => {
        if(chatBodyRef.current) {
            chatBodyRef.current.scrollTop = chatBodyRef.current.scrollHeight;
        }
    }, [chatMessages]);

    useEffect(() => {
        if (textareaRef.current) {
            textareaRef.current.style.height = 'auto';
            const scrollHeight = textareaRef.current.scrollHeight;
            textareaRef.current.style.height = `${scrollHeight}px`;
        }
    }, [newMessage]);

    if (!chatTarget) {
        setRoute({ page: 'messages' });
        return null; 
    }
    
    const handleSend = (e) => {
        e.preventDefault();
        if (newMessage.trim()) {
            onSendMessage({
                text: newMessage.trim(),
                toUserId: isGroupChat ? undefined : withUserId,
                groupId: isGroupChat ? withGroupId : undefined,
            });
            setNewMessage('');
        }
    };

    const handleKeyDown = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSend(e);
        }
    };

    const formatTime = (timestamp) => {
        const date = new Date(timestamp);
        return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    };

    const findSender = (userId) => users.find(u => u.id === userId);

    return (
        <div className="page-container chat-page">
            <div className="chat-container">
                <div className="chat-header">
                    {isGroupChat ? (
                        <div className="convo-avatar group-avatar chat-avatar">
                             <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path d="M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5c-1.66 0-3 1.34-3 3s1.34 3 3 3zm-8 0c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5C6.34 5 5 6.34 5 8s1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5c0-2.33-4.67-3.5-7-3.5zm8 0c-.29 0-.62.02-.97.05 1.16.84 1.97 1.97 1.97 3.45V19h6v-2.5c0-2.33-4.67-3.5-7-3.5z"/></svg>
                        </div>
                    ) : (
                        <img src={otherUser.profilePicture || `https://api.dicebear.com/7.x/initials/svg?seed=${otherUser.fullName}`} alt={otherUser.fullName} className="chat-avatar" />
                    )}
                    <h3>{chatTarget.name || chatTarget.fullName}</h3>
                </div>
                <div className="chat-body" ref={chatBodyRef}>
                    {chatMessages.map(msg => {
                        const sender = findSender(msg.from);
                        const isSent = msg.from === currentUser.id;
                        return (
                            <div key={msg.id} className={`chat-bubble-wrapper ${isSent ? 'sent' : 'received'}`}>
                                {!isSent && isGroupChat && sender && (
                                     <span className="message-sender-name">{sender.firstName}</span>
                                )}
                                <div className={`chat-bubble ${isSent ? 'sent' : 'received'}`}>
                                    <p>{msg.text}</p>
                                    <span className="message-time">{formatTime(msg.timestamp)}</span>
                                </div>
                            </div>
                        )
                    })}
                </div>
                <form className="chat-footer" onSubmit={handleSend}>
                    <textarea 
                        ref={textareaRef}
                        className="chat-input"
                        value={newMessage} 
                        onChange={e => setNewMessage(e.target.value)} 
                        onKeyDown={handleKeyDown}
                        placeholder="Type a message..." 
                        rows="1"
                        aria-label="Chat message input"
                    />
                    <button type="submit" className="btn-send" aria-label="Send Message" disabled={!newMessage.trim()}>
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><path d="M3.478 2.405a.75.75 0 00-.926.94l2.432 7.905H13.5a.75.75 0 010 1.5H4.984l-2.432 7.905a.75.75 0 00.926.94 60.519 60.519 0 0018.445-8.986.75.75 0 000-1.218A60.517 60.517 0 003.478 2.405z"/></svg>
                    </button>
                </form>
            </div>
        </div>
    );
};

// --- LAYOUT & MAIN APP ---

const NotificationBell = ({ notifications, setRoute, onMarkAsRead }) => {
    const [isOpen, setIsOpen] = useState(false);
    const unreadCount = notifications.filter(n => !n.read).length;
    const ref = useRef(null);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (ref.current && !ref.current.contains(event.target)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [ref]);

    const handleNotificationClick = (notification) => {
        onMarkAsRead(notification.id);
        setIsOpen(false);
        if (notification.link) {
            setRoute(notification.link);
        }
    };

    return (
        <div className="notification-area" ref={ref}>
            <button className="notification-btn" onClick={() => setIsOpen(!isOpen)} aria-label={`Notifications (${unreadCount} unread)`}>
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path><path d="M13.73 21a2 2 0 0 1-3.46 0"></path></svg>
                {unreadCount > 0 && <span className="notification-badge">{unreadCount}</span>}
            </button>
            {isOpen && (
                <div className="notification-dropdown">
                    {notifications.length > 0 ? (
                        notifications.map(n => (
                            <div key={n.id} className={`notification-item ${n.read ? 'read' : ''}`} onClick={() => handleNotificationClick(n)}>
                                <p>{n.text}</p>
                                <span className="notification-time">{new Date(n.timestamp).toLocaleString()}</span>
                            </div>
                        ))
                    ) : (
                        <div className="notification-item"><p>No notifications yet.</p></div>
                    )}
                </div>
            )}
        </div>
    );
};

const Header = ({ currentUser, setRoute, route, onSignOut, notifications, onMarkAsRead }) => {
    const isAdmin = currentUser.role === 'Class President' || currentUser.role === 'Admin';
    const navLinks = [
        { page: 'home', label: 'Home' },
        { page: 'announcements', label: 'Announcements' },
        { page: 'faculty', label: 'Faculty' },
        { page: 'courses', label: 'Courses' },
        { page: 'documents', label: 'Documents' },
        { page: 'quizzes', label: 'Quizzes' },
        { page: 'members', label: 'Members' },
        { page: 'messages', label: 'Messages' },
        isAdmin && { page: 'admin', label: 'Admin Panel' }
    ].filter(Boolean);

    return (
        <header className="header">
            <div className="container">
                <h1 className="logo">LAUTECH ECO'29</h1>
                <nav>
                    {navLinks.map(link => (
                        <a href="#" key={link.page} className={route.page === link.page ? 'active' : ''} onClick={(e) => { e.preventDefault(); setRoute({ page: link.page }); }}>
                            {link.label}
                        </a>
                    ))}
                </nav>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <NotificationBell notifications={notifications} setRoute={setRoute} onMarkAsRead={onMarkAsRead} />
                    <a href="#" onClick={(e) => { e.preventDefault(); setRoute({ page: 'profile' }); }} title="My Profile">
                        <img src={currentUser.profilePicture || `https://api.dicebear.com/7.x/initials/svg?seed=${currentUser.fullName}`} alt="Profile" className="header-profile-pic" />
                    </a>
                    <button onClick={onSignOut} className="sign-out-btn">Sign Out</button>
                </div>
            </div>
        </header>
    );
};

const Hero = ({ currentUser }) => (
    <section className="hero">
        <div className="container">
            <h1 className="welcome-message">Welcome, {currentUser.firstName}</h1>
            <p>Department of Economics Community Portal. Stay connected with course updates, announcements, and fellow students.</p>
        </div>
    </section>
);

const Footer = () => (
    <footer className="footer">
        <div className="container">
            <div className="footer-grid">
                <div>
                    <h4>About Us</h4>
                    <p>The official community portal for the 2029 graduating class of the Department of Economics at LAUTECH.</p>
                </div>
                <div>
                    <h4>Quick Links</h4>
                    <ul>
                        <li><a href="#">Home</a></li>
                        <li><a href="#">Announcements</a></li>
                        <li><a href="#">Courses</a></li>
                    </ul>
                </div>
                <div>
                    <h4>Contact</h4>
                    <p>Department of Economics,<br />LAUTECH, Ogbomoso, Nigeria.</p>
                </div>
            </div>
            <div className="copyright">
                <p>&copy; {new Date().getFullYear()} LAUTECH Economics Class of '29. All Rights Reserved.</p>
            </div>
        </div>
    </footer>
);


const App = () => {
    const [users, setUsers] = useLocalStorage('app_users', []);
    const [currentUser, setCurrentUser] = useLocalStorage('app_currentUser', null);
    const [route, setRoute] = useLocalStorage('app_route', { page: 'home' });
    const [approvedMatricNumbers, setApprovedMatricNumbers] = useLocalStorage('app_approvedMatric', INITIAL_MATRIC_NUMBERS);
    const [announcements, setAnnouncements] = useLocalStorage('app_announcements', []);
    const [faculty, setFaculty] = useLocalStorage('app_faculty', []);
    const [courses, setCourses] = useLocalStorage('app_courses', INITIAL_COURSES_DATA);
    const [documents, setDocuments] = useLocalStorage('app_documents', []);
    const [quizzes, setQuizzes] = useLocalStorage('app_quizzes', []);
    const [submissions, setSubmissions] = useLocalStorage('app_submissions', []);
    const [messages, setMessages] = useLocalStorage('app_messages', []);
    const [notifications, setNotifications] = useLocalStorage('app_notifications', []);
    const [groups, setGroups] = useLocalStorage('app_groups', []);

    // --- Handlers ---
    const handleSignUp = (formData) => {
        const newUser = {
            id: Date.now(),
            ...formData,
            fullName: `${formData.firstName} ${formData.otherName} ${formData.surname}`.replace(/\s+/g, ' ').trim(),
            role: formData.email === ADMIN_EMAIL ? 'Class President' : 'Student',
            status: 'active',
            profilePicture: null,
        };
        setUsers(prev => [...prev, newUser]);
        setCurrentUser(newUser);
        setRoute({ page: 'home' });
    };

    const handleSignIn = (user) => {
        setCurrentUser(user);
        setRoute({ page: 'home' });
    };
    
    const handleSignOut = () => {
        setCurrentUser(null);
        setRoute({ page: 'home' }); 
    };
    
    const handleProfileUpdate = (updatedData) => {
        setCurrentUser(prev => ({...prev, ...updatedData}));
        setUsers(prevUsers => prevUsers.map(u => u.id === currentUser.id ? {...u, ...updatedData} : u));
    };
    
    const handleAddAnnouncement = (data) => {
        const newAnnouncement = {
            id: Date.now(),
            ...data,
            date: new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }),
        };
        setAnnouncements(prev => [newAnnouncement, ...prev]);
    };
    
    const handleAddFaculty = (data) => {
        const newFaculty = { id: Date.now(), ...data };
        setFaculty(prev => [...prev, newFaculty]);
    };

    const handleCourseUpdate = (level, semester, courseId, updatedData) => {
        setCourses(prev => {
            const newCourses = { ...prev };
            const semesterCourses = newCourses[level][semester];
            const courseIndex = semesterCourses.findIndex(c => c.id === courseId);
            if (courseIndex > -1) {
                semesterCourses[courseIndex] = { ...semesterCourses[courseIndex], ...updatedData };
            }
            return newCourses;
        });
    };
    
    const handleAddDocument = ({ file, customName }) => {
        const reader = new FileReader();
        reader.onload = (e) => {
            const newDocument = {
                id: Date.now(),
                name: customName,
                type: file.type,
                data: e.target.result,
            };
            setDocuments(prev => [newDocument, ...prev]);
        };
        reader.readAsDataURL(file);
    };

    const handleCreateQuiz = (quizData) => {
        const newQuiz = { id: Date.now(), ...quizData };
        setQuizzes(prev => [newQuiz, ...prev]);
        setRoute({ page: 'quizzes' });
    };
    
    const handleDeleteQuiz = (quizId) => {
        if (window.confirm('Are you sure you want to delete this quiz?')) {
            setQuizzes(prev => prev.filter(q => q.id !== quizId));
        }
    };
    
    const handleQuizSubmit = (quizId, answers, userId) => {
        const newSubmission = { id: Date.now(), quizId, userId, answers, timestamp: Date.now() };
        setSubmissions(prev => [...prev, newSubmission]);
        setRoute({ page: 'quizResults', submissionId: newSubmission.id });
    };

    const handleCreateGroup = ({ name, memberIds }) => {
        const newGroup = {
            id: `group_${Date.now()}`,
            name,
            members: memberIds,
            creatorId: currentUser.id,
        };
        setGroups(prev => [...prev, newGroup]);
        setRoute({ page: 'chat', withGroupId: newGroup.id });
    };

    const handleSendMessage = ({ toUserId, groupId, text }) => {
        const newMessage = {
            id: Date.now(),
            from: currentUser.id,
            to: toUserId,
            groupId: groupId,
            text,
            timestamp: Date.now(),
        };
        setMessages(prev => [...prev, newMessage]);
        
        // Handle notifications
        if (toUserId) {
            const receiver = users.find(u => u.id === toUserId);
            if (receiver) {
                const newNotification = {
                    id: Date.now(),
                    userId: toUserId,
                    text: `New message from ${currentUser.firstName}`,
                    read: false,
                    timestamp: Date.now(),
                    link: { page: 'chat', withUserId: currentUser.id },
                };
                setNotifications(prev => [...prev, newNotification]);
            }
        } else if (groupId) {
            const group = groups.find(g => g.id === groupId);
            if (group) {
                group.members.forEach(memberId => {
                    if (memberId !== currentUser.id) {
                         const newNotification = {
                            id: Date.now() + memberId,
                            userId: memberId,
                            text: `New message in ${group.name} from ${currentUser.firstName}`,
                            read: false,
                            timestamp: Date.now(),
                            link: { page: 'chat', withGroupId: groupId },
                        };
                        setNotifications(prev => [...prev, newNotification]);
                    }
                });
            }
        }
    };

    const handleMarkAsRead = (notificationId) => {
        setNotifications(prev => prev.map(n => n.id === notificationId ? { ...n, read: true } : n));
    };

    const handleAddMatricNumber = (matricNumber) => {
        if (!approvedMatricNumbers.includes(matricNumber)) {
            setApprovedMatricNumbers(prev => [...prev, matricNumber]);
        } else {
            alert('Matric number already exists.');
        }
    };
    
    const handleRoleChange = (userId, newRole) => {
        setUsers(prev => prev.map(u => u.id === userId ? { ...u, role: newRole } : u));
    };

    const handleUserStatusChange = (userId, newStatus) => {
         setUsers(prev => prev.map(u => u.id === userId ? { ...u, status: newStatus } : u));
    };

    const userNotifications = notifications.filter(n => n.userId === currentUser?.id).sort((a,b) => b.timestamp - a.timestamp);
    
    // --- Render Logic ---
    if (!currentUser) {
        return <AuthPage onSignIn={handleSignIn} onSignUp={handleSignUp} users={users} approvedMatricNumbers={approvedMatricNumbers} />;
    }
    
    let pageContent;
    switch (route.page) {
        case 'home':
            pageContent = <HomePage setRoute={setRoute} currentUser={currentUser} announcements={announcements} faculty={faculty} />;
            break;
        case 'announcements':
            pageContent = <AnnouncementsPage announcements={announcements} currentUser={currentUser} onAddAnnouncement={handleAddAnnouncement} />;
            break;
        case 'faculty':
            pageContent = <FacultyPage faculty={faculty} currentUser={currentUser} onAddFaculty={handleAddFaculty}/>;
            break;
        case 'courses':
            pageContent = <CoursesPage courses={courses} currentUser={currentUser} onCourseUpdate={handleCourseUpdate} />;
            break;
        case 'documents':
            pageContent = <DocumentsPage documents={documents} currentUser={currentUser} onAddDocument={handleAddDocument} />;
            break;
        case 'quizzes':
            pageContent = <QuizzesPage quizzes={quizzes} currentUser={currentUser} setRoute={setRoute} onDeleteQuiz={handleDeleteQuiz} />;
            break;
        case 'createQuiz':
            pageContent = <CreateQuizPage setRoute={setRoute} onCreateQuiz={handleCreateQuiz} />;
            break;
        case 'takeQuiz':
            const quizToTake = quizzes.find(q => q.id === route.quizId);
            pageContent = quizToTake ? <TakeQuizPage quiz={quizToTake} onSubmit={handleQuizSubmit} currentUser={currentUser} /> : <p>Quiz not found.</p>;
            break;
        case 'quizResults':
            const submission = submissions.find(s => s.id === route.submissionId);
            const quizForResults = submission ? quizzes.find(q => q.id === submission.quizId) : null;
            pageContent = (submission && quizForResults) ? <QuizResultsPage quiz={quizForResults} submission={submission} setRoute={setRoute} /> : <p>Results not found.</p>;
            break;
        case 'members':
            pageContent = <MembersPage users={users} currentUser={currentUser} setRoute={setRoute} />;
            break;
        case 'messages':
            pageContent = <MessagesPage messages={messages} users={users} currentUser={currentUser} setRoute={setRoute} groups={groups} />;
            break;
        case 'createGroup':
            pageContent = <CreateGroupPage users={users} currentUser={currentUser} onCreateGroup={handleCreateGroup} setRoute={setRoute} />;
            break;
        case 'chat':
            pageContent = <ChatPage messages={messages} users={users} currentUser={currentUser} withUserId={route.withUserId} withGroupId={route.withGroupId} onSendMessage={handleSendMessage} setRoute={setRoute} groups={groups}/>;
            break;
        case 'profile':
            pageContent = <ProfilePage currentUser={currentUser} onProfileUpdate={handleProfileUpdate} />;
            break;
        case 'admin':
             pageContent = <AdminPage users={users} onRoleChange={handleRoleChange} approvedMatricNumbers={approvedMatricNumbers} onAddMatricNumber={handleAddMatricNumber} onUserStatusChange={handleUserStatusChange} />;
            break;
        default:
            pageContent = <HomePage setRoute={setRoute} currentUser={currentUser} announcements={announcements} faculty={faculty} />;
    }

    return (
        <>
            <Header currentUser={currentUser} setRoute={setRoute} route={route} onSignOut={handleSignOut} notifications={userNotifications} onMarkAsRead={handleMarkAsRead}/>
            <main>
                {pageContent}
            </main>
            <Footer />
        </>
    );
};

const container = document.getElementById('root');
const root = createRoot(container);
root.render(<App />);