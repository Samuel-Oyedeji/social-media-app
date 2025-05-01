'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { createClient } from '@/utils/supabase/client';

interface Draft {
  id: string;
  platform: string;
  content: string;
  image?: string;
}

interface DraftListProps {
  drafts: Draft[];
}

export default function DraftList({ drafts }: DraftListProps) {
  const [selectedDraft, setSelectedDraft] = useState<{ id: string; content: string } | null>(null);
  const supabase = createClient();

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