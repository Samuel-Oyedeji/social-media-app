'use client';

import { useState } from 'react';
import { createClient } from '@/utils/supabase/server';
import { redirect } from 'next/navigation';
import { AppSidebar } from '@/components/global/app-sidebar';
import { SidebarProvider, SidebarInset, SidebarTrigger } from '@/components/ui/sidebar';
import { Separator } from '@/components/ui/separator';
import { ModeToggle } from '@/components/global/Mode-toggle';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { createClient as createBrowserClient } from '@/utils/supabase/client';

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

function DraftList({ drafts }: { drafts: { id: string; platform: string; content: string; image?: string }[] }) {
  const [selectedDraft, setSelectedDraft] = useState<{ id: string; content: string } | null>(null);
  const supabase = createBrowserClient(); // Use client-side Supabase for DraftList

  const handleUpdateDraft = async (draftId: string, content: string) => {
    const { error } = await supabase
      .from('posts')
      .update({ content })
      .eq('id', draftId);

    if (!error) {
      setSelectedDraft(null);
    }
  };

  return (
    <div className="grid gap-4">
      {drafts.map((draft) => (
        <Card key={draft.id}>
          <CardHeader>
            <CardTitle>{draft.platform} Draft</CardTitle>
          </CardHeader>
          <CardContent>
            <p>{draft.content}</p>
            {draft.image && <img src={draft.image} alt="Draft image" className="mt-2 max-w-full h-auto" />}
            <Button className="mt-2" onClick={() => setSelectedDraft({ id: draft.id, content: draft.content })}>
              Edit
            </Button>
          </CardContent>
        </Card>
      ))}
      {selectedDraft && (
        <Dialog open={!!selectedDraft} onOpenChange={() => setSelectedDraft(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Edit Draft</DialogTitle>
            </DialogHeader>
            <Textarea
              value={selectedDraft.content}
              onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
                setSelectedDraft({ ...selectedDraft, content: e.target.value })
              }
              className="min-h-[100px]"
            />
            <Button onClick={() => handleUpdateDraft(selectedDraft.id, selectedDraft.content)}>Save Changes</Button>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}