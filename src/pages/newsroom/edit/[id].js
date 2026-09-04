import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import Head from "next/head";
import NewsroomLayout from "../../../components/NewsroomLayout";
import ArticleForm from "../../../components/ArticleForm";
import { useNewsroomUser, authedFetch } from "../../../lib/useNewsroomUser";

export default function EditArticle() {
  const router = useRouter();
  const { id } = router.query;
  const { user } = useNewsroomUser();
  const [article, setArticle] = useState(undefined);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!user || !id) return;
    authedFetch(`/api/newsroom/articles/${id}`)
      .then(async (res) => {
        const data = await res.json();
        if (!res.ok) {
          setError(data.error || "Artikel tidak dijumpai.");
          setArticle(null);
          return;
        }
        setArticle(data.article);
      })
      .catch(() => {
        setError("Gagal memuatkan artikel.");
        setArticle(null);
      });
  }, [user, id]);

  return (
    <NewsroomLayout title="Sunting Artikel">
      <Head>
        <title>Sunting Artikel | Newsroom DNA63</title>
        <meta name="robots" content="noindex, nofollow" />
      </Head>
      {article === undefined && <p className="text-gray-400">Memuatkan...</p>}
      {error && <p className="text-sabah-red font-medium">{error}</p>}
      {article && <ArticleForm initialArticle={article} articleId={id} />}
    </NewsroomLayout>
  );
}
