"use client";

import React from 'react';
import InfoCentreListPage from "../../../../app/pages/InfoCentreListPage";

export default function ListPage({ params }) {
  // Use React.use() to unwrap the params promise
  const unwrappedParams = React.use(params);
  // Pass the category ID directly as a prop
  return <InfoCentreListPage category={unwrappedParams.id} />;
}
