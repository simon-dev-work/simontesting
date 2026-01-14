"use client"

import React from "react";
import Navbar from "../Navbar";
import InfoCentreHomePage from "../InfoCentreHomePage";
import FooterPage from "../FooterPage";
import { useEffect, useState } from 'react';
import Link from "next/link";

const InfoCentreHome = () => {

  return (
    <div>
      <Navbar />
      <InfoCentreHomePage />
      <FooterPage />
    </div>
  );
};

export default InfoCentreHome;
