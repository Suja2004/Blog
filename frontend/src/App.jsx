import { Routes, Route } from 'react-router-dom';
import BlogList from './components/Blog/BlogList';
import BlogPost from './components/Blog/BlogPost';
import CreateBlog from './components/Blog/CreateBlog';
import EditBlog from './components/Blog/EditBlog';
import Navbar from './components/Navbar';
import Register from './components/Auth/Register';
import Login from './components/Auth/Login';
import UserProfile from './components/UserProfile';


const App = () => {
  return (
    <>
      <Navbar />
      <Routes>
        <Route path="/register" element={<Register />} />
        <Route path="/login" element={<Login />} />
        <Route path="/profile" element={<UserProfile />} />
        <Route path="/" element={<BlogList />} />
        <Route path="/blogs/:id" element={<BlogPost />} />
        <Route path="/create" element={<CreateBlog />} />
        <Route path="/edit/:id" element={<EditBlog />} />
      </Routes>
    </>
  );
};

export default App;