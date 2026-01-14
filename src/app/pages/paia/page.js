"use client"

import React from "react";
import Navbar from "../Navbar";
import FooterPage from "../FooterPage";
import PaiaManualPage from "../PaiaManualPage";
import { useEffect, useState } from 'react';
import Link from "next/link";

const PaiaManual = () => {

  return (
    <div>
      <Navbar />
      <PaiaManualPage />
      <FooterPage />
    </div>
  );
};

export default PaiaManual;
