import { NextRequest, NextResponse } from "next/server";

const BACKEND_URL = "http://localhost:8080";

async function handleProxy(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  const resolvedParams = await params;
  const pathSegments = resolvedParams.path || [];
  const path = pathSegments.map((segment) => encodeURIComponent(segment)).join("/");
  
  const searchParams = request.nextUrl.search;
  const targetUrl = `${BACKEND_URL}/${path}${searchParams}`;

  // Read incoming headers
  const headers = new Headers();
  request.headers.forEach((value, key) => {
    // Forward relevant headers and drop connection specific ones
    if (
      key.toLowerCase() !== "host" &&
      key.toLowerCase() !== "connection" &&
      key.toLowerCase() !== "content-length"
    ) {
      headers.set(key, value);
    }
  });

  // Read request body for body-carrying methods
  let body: any = null;
  if (["POST", "PUT", "PATCH"].includes(request.method)) {
    try {
      body = await request.arrayBuffer();
    } catch {
      // No body or failed to read
    }
  }

  try {
    const response = await fetch(targetUrl, {
      method: request.method,
      headers,
      body,
      redirect: "manual",
      // @ts-ignore
      duplex: "half", // Necessary for fetch body forwarding in Node runtime
    });

    // Create the response headers to return
    const responseHeaders = new Headers();
    response.headers.forEach((value, key) => {
      // Keep headers but avoid duplicate or connection headers
      if (
        key.toLowerCase() !== "connection" &&
        key.toLowerCase() !== "transfer-encoding"
      ) {
        responseHeaders.append(key, value);
      }
    });

    const responseBody = await response.arrayBuffer();

    return new NextResponse(responseBody, {
      status: response.status,
      statusText: response.statusText,
      headers: responseHeaders,
    });
  } catch (error) {
    console.error("Proxy error:", error);
    return NextResponse.json(
      { error: "Failed to forward request to Go backend. Ensure backend is running." },
      { status: 502 }
    );
  }
}

export async function GET(request: NextRequest, context: { params: Promise<{ path: string[] }> }) {
  return handleProxy(request, context);
}

export async function POST(request: NextRequest, context: { params: Promise<{ path: string[] }> }) {
  return handleProxy(request, context);
}

export async function PUT(request: NextRequest, context: { params: Promise<{ path: string[] }> }) {
  return handleProxy(request, context);
}

export async function DELETE(request: NextRequest, context: { params: Promise<{ path: string[] }> }) {
  return handleProxy(request, context);
}
