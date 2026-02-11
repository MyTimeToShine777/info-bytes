'use client';

import { useParams } from 'next/navigation';
import { PostEditor } from '../new/page';
import { AdminShell } from '../../page';

export default function EditPostPage() {
  const { id } = useParams();
  return <PostEditor postId={id} />;
}
