import Head from "next/head";
import NewsroomLayout from "../../components/NewsroomLayout";
import ArticleForm from "../../components/ArticleForm";

export default function NewArticle() {
  return (
    <NewsroomLayout title="Artikel Baru">
      <Head>
        <title>Artikel Baru | Newsroom DNA63</title>
        <meta name="robots" content="noindex, nofollow" />
      </Head>
      <ArticleForm />
    </NewsroomLayout>
  );
}
