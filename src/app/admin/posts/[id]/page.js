'use client';

import { useParams } from 'next/navigation';
import { PostEditor } from '../new/page';

export default function EditPostPage() {
  const params = useParams();
  return <PostEditor postId={params.id} />;
}
