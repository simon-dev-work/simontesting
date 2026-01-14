import { NextResponse } from "next/server";

export async function GET(request, { params }) {
  // Await the params object before destructuring
  const { practiceId } = await Promise.resolve(params);

  try {
    // Fetch icons for the practice
    const response = await fetch(`https://eyecareportal.herokuapp.com/api/website/${practiceId}/0`, {
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch icons: ${response.status}`);
    }

    const data = await response.json();

    const iconsArray = Array.isArray(data.icons) ? data.icons : [];

    const iconsMap = {};
    iconsArray.forEach((icon) => {
      if (icon.id && icon.icon) {
        iconsMap[icon.id] = icon.icon;
      }
    });

    return NextResponse.json({ iconsMap });
  } catch (error) {
    console.error("[Icons API] Error:", error);

    return NextResponse.json(
      {
        error: "Internal server error",
        message: error.message,
        stack: process.env.NODE_ENV === "development" ? error.stack : undefined,
      },
      { status: 500 }
    );
  }
}
