"use client"

import React from "react";
import Navbar from "../Navbar";
import FooterPage from "../FooterPage";
import PrivacyPolicyPage from "../PrivacyPolicyPage";
import { useEffect, useState } from 'react';
import Link from "next/link";

const PrivacyPolicy = () => {

  return (
    <div>
      <Navbar />
      <PrivacyPolicyPage />
      <FooterPage />
    </div>
  );
};

export default PrivacyPolicy;
