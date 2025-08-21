import React from 'react'
// import Home from './components/Home'
import Navbar from './components/Navbar'
import Hero from './components/Hero'

// import Services from './components/Services'
// import Projects from './components/Projects'
// import ProjectForm from './components/ProjectForm'
// import Contact from './components/Contact'
import Signup from './Signup/page'
import Login from './Login/page'
import About from './About/page'
// import AuthModal from './components/AuthModal'
import Upload from './Uploads/page'
import Services from './Services/page'
import Projects from './Project/page'
import Contact from './Contact/page'
import ThreeScene from './components/ThreeScene'


function page() {
  return (
   <>
   <Navbar/>
   <Hero/>
   <About/>
   <Services/>
   <Projects/>
   {/* <ProjectForm/> */}
   <Contact/>
   {/* <AuthModal/> */}
    {/* <Signup/>
    <Login/> */}

   </>
  )
}

export default page