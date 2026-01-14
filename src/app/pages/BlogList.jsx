import { useRouter } from 'next/router';

const BlogListDetail = () => {
  const router = useRouter();
  const { id } = router.query;

  return (
    <div>
      <h1>Blog List Detail Page</h1>
      <p>You are viewing blog post with ID: {id}</p>
    </div>
  );
};

export default BlogListDetail;