import { promises as fs } from 'fs';
import path from 'path';
import { MDXRemote } from 'next-mdx-remote/rsc';

export default async function LaunchBlog() {
  const file = await fs.readFile(path.join(process.cwd(), 'launch/launch-blog.mdx'), 'utf8');
  return (
    <article className="prose mx-auto p-8">
      <MDXRemote source={file} />
    </article>
  );
}
