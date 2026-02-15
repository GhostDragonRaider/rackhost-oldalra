import React, { useState, useEffect } from "react";
import avatarImage from "../images/avatar-svgrepo-com.svg";
import TypeWriter from "../components/Typewriter";
import Describe from "../components/describe";
import Skills from "../components/skills";
import Projects from "../components/Projects";
import Footer from "../components/footer";

export default function Home() {
  return (
    <div className="homepage-container">
      <div className="home-page-div">
        <img
          src={avatarImage.src}
          className="home-page-avatar"
          alt="avatar"
        ></img>
        <h1 className="home-page-title">AntiCode</h1>
        <span className="home-page-message">
          <TypeWriter
            text="Online rendszerek, amelyek ügyfeleket hoznak és időt takarítanak meg."
            speed={50}
          />
        </span>
      </div>
      <Describe />
      <Skills />
      <Projects />
      <Footer />
    </div>
  );
}
