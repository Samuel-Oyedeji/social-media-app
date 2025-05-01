'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
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
  const [deleteDraftId, setDeleteDraftId] = useState<string | null>(null);
  const [localDrafts, setLocalDrafts] = useState<Draft[]>(drafts);
  const supabase = createClient();

  const handleUpdateDraft = async (draftId: string, content: string) => {
    const { error } = await supabase
      .from('posts')
      .update({ content })
      .eq('id', draftId);

    if (!error) {
      setLocalDrafts(localDrafts.map((draft) => (draft.id === draftId ? { ...draft, content } : draft)));
      setSelectedDraft(null);
    }
  };

  const handlePublishDraft = async (draftId: string) => {
    const { error } = await supabase
      .from('posts')
      .update({ is_draft: false })
      .eq('id', draftId);

    if (!error) {
      setLocalDrafts(localDrafts.filter((draft) => draft.id !== draftId));
    }
  };

  const handleDeleteDraft = async () => {
    if (!deleteDraftId) return;
    const { error } = await supabase
      .from('posts')
      .delete()
      .eq('id', deleteDraftId);

    if (!error) {
      setLocalDrafts(localDrafts.filter((draft) => draft.id !== deleteDraftId));
      setDeleteDraftId(null);
    }
  };

  return (
    <div className="grid gap-4">
      {localDrafts.map((draft) => (
        <Card key={draft.id}>
          <CardHeader>
            <CardTitle>{draft.platform} Draft</CardTitle>
          </CardHeader>
          <CardContent>
            <p>{draft.content}</p>
            {draft.image && <img src={draft.image} alt="Draft image" className="mt-2 max-w-full h-auto" />}
            <div className="flex gap-2 mt-2">
              <Button onClick={() => setSelectedDraft({ id: draft.id, content: draft.content })}>
                Edit
              </Button>
              <Button onClick={() => handlePublishDraft(draft.id)}>Publish</Button>
              <Button variant="destructive" onClick={() => setDeleteDraftId(draft.id)}>
                Delete
              </Button>
            </div>
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
      {deleteDraftId && (
        <Dialog open={!!deleteDraftId} onOpenChange={() => setDeleteDraftId(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Confirm Deletion</DialogTitle>
              <DialogDescription>
                Are you sure you want to delete this draft? This action cannot be undone.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button variant="outline" onClick={() => setDeleteDraftId(null)}>
                Cancel
              </Button>
              <Button variant="destructive" onClick={handleDeleteDraft}>
                Delete
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}