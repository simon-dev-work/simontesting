// src/app/pages/PaiaManualPage.jsx
"use client";

import React from "react";
import Loader from "../components/Loader";
import FooterPage from "../pages/FooterPage";
import Navbar from "./Navbar";
import { useSiteSettings } from "../context/SiteSettingsContext";
import Link from "next/link";

export default function PaiaManualPage() {
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
            Failed to Load PAIA Manual
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
            <i className="text-white text-2xl">PAIA Manual</i>
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
              <h2 className="text-2xl font-bold text-[var(--primary-color)] mb-4 border-b border-gray-300 pb-2">
                1. Introduction
              </h2>
              <p className="text-gray-800 leading-relaxed">
                The Promotion of Access to Information Act, No. 2 of 2000 (PAIA)
                gives effect to the constitutional right of access to
                information held by public and private bodies.{" "}
                <strong>{siteSettings?.name}</strong> acknowledges the
                importance of transparency and accountability and is committed
                to fulfilling its obligations under PAIA.
              </p>
            </section>

            {/* 2. Contact Details */}
            <section className="mb-12">
              <h2 className="text-2xl font-bold text-[var(--primary-color)] mb-4 border-b border-gray-300 pb-2">
                2. Contact Details of Information Officer
              </h2>
              <section className="mb-6 bg-gray-50 p-6 rounded shadow-sm border border-gray-200">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Left column */}
                  <div className="space-y-1">
                    <p className="text-gray-700">
                      <strong>Organization Name:</strong> {siteSettings?.name}
                    </p>
                    <p className="text-gray-700">
                      <strong>Physical Address:</strong>{" "}
                      {siteSettings?.address_1}
                    </p>

                    <p className="text-gray-700">
                      <strong>Telephone:</strong> {siteSettings?.tel}
                    </p>
                    <p className="text-gray-700">
                      <strong>Email:</strong> {siteSettings?.email}
                    </p>
                  </div>                  
                </div>
              </section>
            </section>

            {/* 3. Guide to Using Manual */}
            <section className="mb-12">
              <h2 className="text-2xl font-bold text-[var(--primary-color)] mb-4 border-b border-gray-300 pb-2">
                3. Guide to Using this Manual
              </h2>
              <p className="text-gray-800 leading-relaxed">
                This manual provides comprehensive information about the types
                of records held by <strong>{siteSettings?.name}</strong> and the
                procedures for accessing them. It outlines the request process,
                associated fees, and the rights and obligations of both the
                organization and information requesters under PAIA.
              </p>
            </section>

            {/* 5. Records Available */}
            <section className="mb-12">
              <h2 className="text-2xl font-bold text-[var(--primary-color)] mb-4 border-b border-gray-300 pb-2">
                5. Records Available in Terms of Other Legislation
              </h2>
              <div className="space-y-4">
                {[
                  {
                    title: "Companies Act Records",
                    description:
                      "Company incorporation documents, shareholder info, director appointments, financial statements, and annual returns.",
                  },
                  {
                    title: "Income Tax Act Records",
                    description:
                      "Tax obligations, financial statements, payroll records, correspondence with tax authorities.",
                  },
                  {
                    title: "Labour Relations Records",
                    description:
                      "Employment contracts, remuneration, leave, disciplinary proceedings, health and safety compliance.",
                  },
                  {
                    title: "Consumer Protection Records",
                    description:
                      "Consumer transactions, warranties, refunds, and complaint records.",
                  },
                  {
                    title: "Healthcare Regulations",
                    description:
                      "Professional registration certificates, patient care protocols, medical equipment, and regulatory compliance.",
                  },
                  {
                    title: "Financial Sector Records",
                    description:
                      "Audit reports and compliance documents required by financial regulatory bodies.",
                  },
                ].map((record, i) => (
                  <div
                    key={i}
                    className="border border-gray-300 rounded p-6 bg-gray-50"
                  >
                    <h4 className="font-semibold text-gray-800 mb-2">
                      {record.title}
                    </h4>
                    <p className="text-gray-700">{record.description}</p>
                  </div>
                ))}
              </div>
            </section>

            {/* 6. Categories of Records Held */}
            <section className="mb-12">
              <h2 className="text-2xl font-bold text-[var(--primary-color)] mb-4 border-b border-gray-300 pb-2">
                6. Categories of Records Held
              </h2>
              <div className="space-y-4">
                {[
                  {
                    category: "Financial Records",
                    items:
                      "Invoices, receipts, bank statements, budget reports, financial statements, audit documentation.",
                  },
                  {
                    category: "Personnel Records",
                    items:
                      "Employment contracts, performance evaluations, training records, leave requests, disciplinary records.",
                  },
                  {
                    category: "Operational Policies",
                    items:
                      "Organizational policies, procedures, and guidelines covering HR, finance, operations, and patient care.",
                  },
                  {
                    category: "Legal Agreements",
                    items:
                      "Client contracts, supplier agreements, partnership agreements, leases, professional indemnity documents.",
                  },
                  {
                    category: "Patient Records",
                    items:
                      "Medical records, treatment histories, appointment schedules, patient communication records.",
                  },
                  {
                    category: "Regulatory Compliance",
                    items:
                      "Professional registration documents, health and safety protocols, incident reports, regulatory correspondence.",
                  },
                  {
                    category: "Intellectual Property",
                    items: "Trademarks, copyrights, proprietary procedures.",
                  },
                  {
                    category: "Marketing Materials",
                    items:
                      "Campaign records, promotional materials, website content, customer feedback.",
                  },
                ].map((record, i) => (
                  <div
                    key={i}
                    className="border border-gray-300 rounded p-6 bg-gray-50"
                  >
                    <h4 className="font-semibold text-[var(--primary-color)] mb-3">
                      {record.category}
                    </h4>
                    <p className="text-gray-700">{record.items}</p>
                  </div>
                ))}
              </div>
            </section>

            {/* 7. Request Process */}
            <section className="mb-12">
              <h2 className="text-2xl font-bold text-[var(--primary-color)] mb-4 border-b border-gray-300 pb-2">
                7. Request Process
              </h2>
              <p className="text-gray-800 leading-relaxed bg-gray-50 p-6 border border-gray-300 rounded">
                All requests for access to information must be submitted in
                writing to the Information Officer at the contact details above.
                Requests must specify the information sought and the preferred
                format for access. Processing fees may apply as prescribed by
                PAIA regulations.
              </p>
            </section>
          </div>

          {/* Footer Info */}
          <div className="bg-gray-100 px-8 py-6 border-t border-gray-300">
            <div className="flex flex-col md:flex-row justify-between items-center text-sm text-gray-700">
              <div>
                <p className="font-medium">
                  {siteSettings?.name} - PAIA Manual
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
