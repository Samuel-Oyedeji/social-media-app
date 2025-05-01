import { createClient } from '@/utils/supabase/server';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function middleware(request: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const pathname = request.nextUrl.pathname;

  // Allow access to sign-in and auth callback routes
  if (pathname.startsWith('/sign-in') || pathname.startsWith('/auth/callback')) {
    return NextResponse.next();
  }

  // If no user, redirect to sign-in
  if (!user) {
    return NextResponse.redirect(new URL('/sign-in', request.url));
  }

  // Check if user has completed onboarding
  const { data: userData } = await supabase
    .from('users')
    .select('id')
    .eq('id', user.id)
    .single();

  // If no user data, redirect to onboarding
  if (!userData) {
    return NextResponse.redirect(new URL('/onboarding', request.url));
  }

  // Allow access to other routes
  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!_next|api|favicon.ico).*)'],
};