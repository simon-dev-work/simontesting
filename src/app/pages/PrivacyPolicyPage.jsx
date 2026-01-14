"use client";

import React from "react";
import Loader from "../components/Loader";
import FooterPage from "../pages/FooterPage";
import Navbar from "./Navbar";
import { useSiteSettings } from "../context/SiteSettingsContext";
import Link from "next/link";

export default function PrivacyPolicyPage() {
  const { siteSettings, isLoading, error } = useSiteSettings();
  const currentYear = new Date().getFullYear();

  // Handle loading state
  if (isLoading) {
    return <Loader />;
  }

  // Handle error state
  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center bg-white p-8 rounded border border-gray-300">
          <div className="text-red-500 text-4xl mb-4">⚠</div>
          <p className="text-red-700 text-lg font-medium mb-2">
            Failed to Load Privacy Policy
          </p>
          <p className="text-gray-700">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div
      className="bg-gray-50 min-h-screen"
      style={{ "--primary-color": siteSettings?.primaryColor || "#1f2937" }}
    >
      <Navbar />
      {/* Home Page Section */}
      {siteSettings.banners.length > 0 && (
        <div
          className="w-full h-[600px] bg-cover bg-center text-center text-white"
          style={{
            backgroundImage: `url(${siteSettings.banners[0].bannerImg})`,
          }}
        >
          <div
            className="bg-black bg-opacity-50 h-full flex flex-col items-center justify-center p-4"
            style={{
              fontFamily: siteSettings.banners[0].titleGoogleFont || "inherit",
            }}
          >
            <p
              style={{
                fontSize: `${siteSettings.banners[0].titleFontSize}px`,
                fontFamily: `${siteSettings.banners[0].titleGoogleFont}`,
              }}
            >
              {siteSettings?.name}
            </p>
            <hr className="border-t-4 border-[var(--primary-color)]  w-7 mx-auto" />
            <i className="text-white text-2xl">Privacy Policy</i>
          </div>
        </div>
      )}

      {/* Main Content */}
      <article className="max-w-4xl mx-auto px-6 py-8">
        <div className="bg-white border border-gray-300 rounded">
          {/* Document Info */}
          <div className="bg-gray-100 px-8 py-4 border-b border-gray-300">
            <div className="flex flex-col sm:flex-row justify-between items-center text-sm text-gray-700">
              <span className="font-medium">
                Promotion of Access to Information Act Manual
              </span>
              <span>Last Updated: {currentYear}</span>
            </div>
          </div>
          <div className="px-8 py-8 prose prose-gray max-w-none">
            {/* 1. Introduction */}
            <section className="mb-12">
              <h2 className="text-3xl font-bold text-[var(--primary-color)] mb-6 border-b-2 border-gray-300 pb-2">
                1. Introduction
              </h2>

              {/* 1.1 Purpose */}
              <div className="mb-6 bg-gray-50 p-6 rounded shadow-sm border border-gray-200">
                <h3 className="text-xl font-semibold text-gray-800 mb-2">
                  Purpose
                </h3>
                <p className="text-gray-700 leading-relaxed">
                  This Security Policy defines the security requirements for the
                  proper and secure use of the company&apos;s IT services. Its goal
                  is to protect the company and its users against threats that
                  could compromise integrity, privacy, reputation, or business
                  outcomes.
                </p>
              </div>

              {/* 1.2 Scope */}
              <div className="mb-6 bg-gray-50 p-6 rounded shadow-sm border border-gray-200">
                <h3 className="text-xl font-semibold text-gray-800 mb-2">
                  Scope
                </h3>
                <p className="text-gray-700 leading-relaxed">
                  This policy applies to all users of the company’s IT services,
                  including temporary users, visitors with temporary access, and
                  partners with limited or unlimited access. Compliance with the
                  policies in this document is mandatory.
                </p>
              </div>

              {/* 1.3 Company Details */}
              <div className="mb-6 bg-gray-50 p-6 rounded shadow-sm border border-gray-200">
                <h3 className="text-xl font-semibold text-gray-800 mb-4">
                  Company Details
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <p className="text-gray-700">
                      <strong>Organization Name:</strong> {siteSettings?.name}
                    </p>
                    <p className="text-gray-700">
                      <strong>Physical Address:</strong>{" "}
                      {siteSettings?.address_1}
                    </p>
                    <p className="text-gray-700">
                      <strong>Email:</strong> {siteSettings?.email}
                    </p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-gray-700">
                      <strong>Telephone:</strong> {siteSettings?.tel}
                    </p>
                    <p className="text-gray-700">
                      <strong>Policy Author:</strong> {siteSettings?.name}
                    </p>
                  </div>
                </div>
              </div>

              {/* 1.4 Responsibilities */}
              <div className="mb-6 bg-gray-50 p-6 rounded shadow-sm border border-gray-200">
                <h3 className="text-xl font-semibold text-gray-800 mb-4">
                  Responsibilities
                </h3>
                <div className="space-y-4">
                  <div>
                    <h4 className="font-semibold text-gray-800">
                      Chief Information Officer
                    </h4>
                    <p className="text-gray-700">
                      Accountable for all aspects of information security.
                    </p>
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-800">
                      Information Security Officer
                    </h4>
                    <p className="text-gray-700">
                      Responsible for IT security infrastructure, planning
                      against threats, implementing and maintaining security
                      policies, training programs, incident response, and
                      supporting disaster recovery.
                    </p>
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-800">
                      Information Owners
                    </h4>
                    <p className="text-gray-700">
                      Define security requirements, determine privileges, and
                      access rights for their areas.
                    </p>
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-800">
                      IT Security Team
                    </h4>
                    <p className="text-gray-700">
                      Implements IT security, maintains access rights, and
                      supports security policies.
                    </p>
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-800">Users</h4>
                    <p className="text-gray-700">
                      Follow security policies and report any attempted
                      breaches.
                    </p>
                  </div>
                </div>
              </div>

              {/* 1.5 General Policy Definitions */}
              <div className="bg-gray-50 p-6 rounded shadow-sm border border-gray-200">
                <h3 className="text-xl font-semibold text-gray-800 mb-2">
                  General Policy Definitions
                </h3>
                <p className="text-gray-700 leading-relaxed">
                  Exceptions to any policy require authorization from the
                  Information Security Officer, with each exception logged in a
                  security log detailing date, reason, and risk mitigation. All
                  IT services are used in compliance with their technical and
                  security requirements. Infractions may result in disciplinary
                  action or prosecution.
                </p>
              </div>
            </section>

            {/* 2. IT Assets Policy */}
            <section className="mb-12">
              <h2 className="text-2xl font-bold text-[var(--primary-color)] mb-4 border-b border-gray-300 pb-2">
                2. IT Assets Policy
              </h2>

              <p className="text-gray-800 leading-relaxed">
                This section defines requirements for proper handling of all IT
                assets including desktops, laptops, printers, applications, and
                software.
              </p>

              <ul className="list-disc ml-6 text-gray-800 space-y-1">
                <li>
                  IT assets must only be used for authorized business
                  activities.
                </li>
                <li>
                  All assets are classified according to their business
                  function.
                </li>
                <li>
                  Users are responsible for the assets assigned to them;
                  oversight is provided by the ISO.
                </li>
                <li>
                  Active devices must be secured when unattended, and access is
                  restricted to authorized personnel.
                </li>
                <li>
                  Portable devices must be encrypted, maintained, and protected
                  from theft or damage.
                </li>
                <li>
                  Loss, theft, or damage must be reported immediately to the
                  Information Security Officer.
                </li>
                <li>
                  Disposal of assets storing confidential information must be
                  physically destroyed or securely erased in the presence of the
                  ISO.
                </li>
                <li>
                  Paper documents must be shredded using a confetti cross
                  shredder.
                </li>
              </ul>
            </section>

            {/* 3. Access Control Policy */}
            <section className="mb-12">
              <h2 className="text-2xl font-bold text-[var(--primary-color)] mb-4 border-b border-gray-300 pb-2">
                3. Access Control Policy
              </h2>
              <p className="text-gray-800 leading-relaxed">
                Access to IT systems is controlled under the principle of least
                privilege. All confidential or sensitive systems use
                password-based authentication and access control lists. Users
                are monitored for attempts to bypass controls, and automatic
                scanning and periodic reviews are in place.
              </p>
            </section>

            {/* 4. Password Control Policy */}
            <section className="mb-12">
              <h2 className="text-2xl font-bold text-[var(--primary-color)] mb-4 border-b border-gray-300 pb-2">
                4. Password Control Policy
              </h2>
              <p className="text-gray-800 leading-relaxed">
                Users have unique identities and strong alphanumeric passwords
                with complexity rules. Passwords are rotated regularly and
                sharing is prohibited. Accounts are locked if suspicious
                activity is detected.
              </p>
            </section>

            {/* 5. Email Policy */}
            <section className="mb-12">
              <h2 className="text-2xl font-bold text-[var(--primary-color)] mb-4 border-b border-gray-300 pb-2">
                5. Email Policy
              </h2>
              <p className="text-gray-800 leading-relaxed">
                Company email resources are for business purposes only.
                Confidential information must only be shared with authorized
                recipients. Security measures, including digital rights,
                antivirus scanning, and strong passwords, are enforced. Users
                must not respond directly to attacks, but report to the ISO.
              </p>
            </section>

            {/* 6. Internet Policy */}
            <section className="mb-12">
              <h2 className="text-2xl font-bold text-[var(--primary-color)] mb-4 border-b border-gray-300 pb-2">
                6. Internet Policy
              </h2>
              <p className="text-gray-800 leading-relaxed">
                Internet access is limited to business use. Risky sites,
                personal browsing, or unauthorized downloads are prohibited.
                Traffic is monitored, and attacks or abuse must be reported.
              </p>
            </section>

            {/* 7. Antivirus Policy */}
            <section className="mb-12">
              <h2 className="text-2xl font-bold text-[var(--primary-color)] mb-4 border-b border-gray-300 pb-2">
                7. Antivirus Policy
              </h2>
              <p className="text-gray-800 leading-relaxed">
                All devices connecting to the company network must have
                centrally managed antivirus with real-time protection.
                Definitions must auto-update, and devices must be “healthy” to
                access company resources.
              </p>
            </section>

            {/* 8. Information Classification Policy */}
            <section className="mb-12">
              <h2 className="text-2xl font-bold text-[var(--primary-color)] mb-4 border-b border-gray-300 pb-2">
                8. Information Classification Policy
              </h2>
              <p className="text-gray-800 leading-relaxed">
                Information is classified into confidential, sensitive,
                shareable, private, and public categories. Owners and the ISO
                ensure confidentiality, integrity, and availability. Breaches
                must be reported immediately.
              </p>
            </section>

            {/* 9. Remote Access Policy */}
            <section className="mb-12">
              <h2 className="text-2xl font-bold text-[var(--primary-color)] mb-4 border-b border-gray-300 pb-2">
                9. Remote Access Policy
              </h2>
              <p className="text-gray-800 leading-relaxed">
                Secure remote access is granted only with authorization and
                through mutually authenticated secure channels. Remote access to
                confidential information is restricted.
              </p>
            </section>

            {/* 10. Outsourcing Policy */}
            <section className="mb-12">
              <h2 className="text-2xl font-bold text-[var(--primary-color)] mb-4 border-b border-gray-300 pb-2">
                10. Outsourcing Policy
              </h2>
              <p className="text-gray-800 leading-relaxed">
                Outsourcing IT services requires careful risk evaluation,
                provider selection, service level agreements, and auditing to
                ensure security and performance.
              </p>
            </section>

            {/* 11. Annex / Glossary */}
            <section className="mb-12">
              <h2 className="text-2xl font-bold text-[var(--primary-color)] mb-4 border-b border-gray-300 pb-2">
                11. Glossary
              </h2>
              <ul className="list-disc ml-6 text-gray-800 space-y-1">
                <li>
                  <strong>Access Management:</strong> Process that allows users
                  to access IT services or assets.
                </li>
                <li>
                  <strong>Asset:</strong> Any resource or capability
                  contributing to service delivery.
                </li>
                <li>
                  <strong>Audit:</strong> Formal inspection to verify
                  compliance, accuracy, and effectiveness.
                </li>
                <li>
                  <strong>Confidentiality:</strong> Principle that data is
                  accessed only by authorized personnel.
                </li>
                <li>
                  <strong>External Service Provider:</strong> IT service
                  provider from another organization.
                </li>
                <li>
                  <strong>Identity:</strong> Unique name to identify a user or
                  role.
                </li>
                <li>
                  <strong>Information Security Policy:</strong> Governs
                  organization’s approach to information security.
                </li>
                <li>
                  <strong>Outsourcing:</strong> Using an external provider to
                  manage IT services.
                </li>
                <li>
                  <strong>Policy:</strong> Documented management expectations
                  guiding decisions and processes.
                </li>
                <li>
                  <strong>Risk:</strong> Event that could cause harm or impact
                  objectives.
                </li>
                <li>
                  <strong>Service Level:</strong> Measured achievement against
                  defined targets.
                </li>
                <li>
                  <strong>Warranty:</strong> Assurance that a product or service
                  meets agreed requirements.
                </li>
              </ul>
            </section>
          </div>

          {/* Footer Info */}
          <div className="bg-gray-100 px-8 py-6 border-t border-gray-300">
            <div className="flex flex-col md:flex-row justify-between items-center text-sm text-gray-700">
              <div>
                <p className="font-medium">
                  {siteSettings?.name} - Privacy Policy
                </p>
                <p>
                  Compiled in accordance with the Promotion of Access to
                  Information Act, No. 2 of 2000
                </p>
              </div>
              <div className="mt-4 md:mt-0 text-right">
                <p>Last Updated: {currentYear}</p>
              </div>
            </div>
          </div>
        </div>
      </article>

      <FooterPage />
    </div>
  );
}
