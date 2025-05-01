import { createClient } from '@/utils/supabase/server';
import { redirect } from 'next/navigation';
import { AppSidebar } from '@/components/global/app-sidebar';
import { SidebarProvider, SidebarInset, SidebarTrigger } from '@/components/ui/sidebar';
import { Separator } from '@/components/ui/separator';
import { ModeToggle } from '@/components/global/Mode-toggle';
import DraftList from '@/components/core/DraftList';

export default async function Drafts() {
  const supabase = await createClient();
  const { data: { user }, error } = await supabase.auth.getUser();

  if (error || !user) {
    return redirect('/sign-in');
  }

  const { data: drafts } = await supabase
    .from('posts')
    .select('id, platform, content, image')
    .eq('user_id', user.id)
    .eq('is_draft', true);

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4">
          <SidebarTrigger className="-ml-1" />
          <Separator orientation="vertical" className="mr-2 h-4" />
          <div className="flex-1" />
          <ModeToggle />
        </header>
        <div className="p-4">
          <h1 className="text-2xl font-bold mb-6">Your Drafts</h1>
          {drafts && drafts.length > 0 ? (
            <DraftList drafts={drafts} />
          ) : (
            <p>No drafts found.</p>
          )}
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}