import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

// GET /api/admin/staff - List all staff & admin accounts (Admin only)
export async function GET() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Verify caller is admin
  const { data: profile, error: profileErr } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (profileErr || profile?.role !== "admin") {
    return NextResponse.json(
      { error: "Forbidden: Only Administrators can view staff administration records." },
      { status: 403 }
    );
  }

  // Fetch all staff and admin accounts
  const { data: staffList, error } = await supabase
    .from("profiles")
    .select("id, full_name, role, created_at")
    .in("role", ["admin", "staff"])
    .order("created_at", { ascending: false });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ staff: staffList });
}

// POST /api/admin/staff - Authorize/Invite a new staff member (Admin only)
export async function POST(request: NextRequest) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Verify caller is admin from trusted profiles record
  const { data: profile, error: profileErr } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (profileErr || profile?.role !== "admin") {
    return NextResponse.json(
      { error: "Forbidden: Only Administrators are permitted to invite or create staff accounts." },
      { status: 403 }
    );
  }

  const body = await request.json();
  const { email, fullName, role = "staff" } = body;

  if (!email || !email.includes("@")) {
    return NextResponse.json({ error: "Valid email address is required." }, { status: 400 });
  }

  if (role !== "staff" && role !== "admin") {
    return NextResponse.json({ error: "Invalid role specified." }, { status: 400 });
  }

  // Admin client requires SUPABASE_SERVICE_ROLE_KEY
  const adminClient = createAdminClient();

  if (!adminClient) {
    return NextResponse.json(
      {
        error:
          "SUPABASE_SERVICE_ROLE_KEY is required in .env.local to invite or provision staff users through the Supabase Auth Admin API. Please add SUPABASE_SERVICE_ROLE_KEY to your .env.local file.",
        missingKey: true,
      },
      { status: 400 }
    );
  }

  try {
    // 1. Send invite or create user via Supabase Auth Admin API
    const { data: inviteData, error: inviteError } = await adminClient.auth.admin.inviteUserByEmail(
      email.trim(),
      {
        data: {
          full_name: fullName?.trim() || "",
        },
      }
    );

    if (inviteError) {
      // If user already exists in auth.users, promote their role in profiles
      if (inviteError.message.includes("already has been registered") || inviteError.message.includes("already registered")) {
        // Find user by email
        const { data: listData } = await adminClient.auth.admin.listUsers();
        const existingUser = listData?.users.find((u) => u.email?.toLowerCase() === email.trim().toLowerCase());

        if (existingUser) {
          const { error: updateErr } = await adminClient
            .from("profiles")
            .update({ role, full_name: fullName?.trim() || existingUser.user_metadata?.full_name || "" })
            .eq("id", existingUser.id);

          if (updateErr) {
            return NextResponse.json({ error: updateErr.message }, { status: 500 });
          }

          return NextResponse.json({
            success: true,
            message: `User ${email} found and upgraded to ${role}.`,
            user: { id: existingUser.id, email: existingUser.email, role },
          });
        }
      }
      return NextResponse.json({ error: inviteError.message }, { status: 400 });
    }

    const createdUserId = inviteData.user?.id;

    if (createdUserId) {
      // Update profile with designated role
      await adminClient
        .from("profiles")
        .update({ role, full_name: fullName?.trim() || "" })
        .eq("id", createdUserId);
    }

    return NextResponse.json({
      success: true,
      message: `Staff invitation dispatched to ${email}.`,
      user: inviteData.user,
    });
  } catch (err: any) {
    return NextResponse.json(
      { error: err?.message || "An unexpected error occurred while provisioning staff member." },
      { status: 500 }
    );
  }
}
