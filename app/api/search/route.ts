import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get("query");

  if (!query) {
    return NextResponse.json(
      { error: "Query parameter is required" },
      { status: 400 }
    );
  }

  try {
    console.log("Fetching from AustLII with query:", query);
    const response = await fetch(
      `http://www.austlii.edu.au/cgi-bin/sinosrch.cgi?query=${encodeURIComponent(
        query
      )}&meta=/au&method=auto&results=20`
    );

    console.log("Fetch Received", response.ok);

    // if (!response.ok) {
    //   throw new Error("Failed to fetch from AustLII");
    // }

    const data = await response.text();

    console.log("Data received from AustLII");
    return NextResponse.json({ data });
  } catch (error) {
    console.error("Error fetching search results:", error);
    return NextResponse.json(
      { error: "Failed to fetch search results" },
      { status: 500 }
    );
  }
}
