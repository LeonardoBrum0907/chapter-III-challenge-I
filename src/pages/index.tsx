import format from 'date-fns/format';
import ptBR from 'date-fns/locale/pt-BR';
import { GetStaticProps } from 'next';
import Link from 'next/link';
import { useState } from 'react';
import { HiOutlineCalendar, HiUser } from 'react-icons/hi';
import Header from "../components/Header";
import { getPrismicClient } from '../services/prismic';
import commonStyles from '../styles/common.module.scss';
import styles from './home.module.scss';

interface Post {
  uid?: string;
  first_publication_date: string | null;
  data: {
    title: string;
    subtitle: string;
    author: string;
  };
}

interface PostPagination {
  next_page: string;
  results: Post[];
}

interface HomeProps {
  postsPagination: PostPagination;
}

export default function Home({ postsPagination }: HomeProps) {
  // TODO
  const formattedPost = postsPagination.results.map( post => {
    return {
      ...post,
      first_publication_date: format(
        new Date(post.first_publication_date),
        'dd MMM yyyy',
        {
          locale: ptBR,
        }
      ),
    }
  })

  const [posts, setPosts] = useState<Post[]>(formattedPost)
  const [nextPage, setNextPage] = useState(postsPagination.next_page)
  const [currentPage, setCurrentPage] = useState(1)

  async function handleNextPage(): Promise<void> {
    if(currentPage !== 1 && nextPage === null) {
      return
    }

    const postResults = await fetch(`${nextPage}`).then(response => response.json());

    setNextPage(postResults.next_page)
    setCurrentPage(postResults.page)

    const newPost = postResults.results.map(post => {
      return {
        uid: post.uid,
        first_publication_date: format(
          new Date(post.first_publication_date),
          'dd MMM yyyy',
          {
            locale: ptBR,
          }
        ),
        data: {
          title: post.data.title,
          subtitle: post.data.subtitle,
          author: post.data.author,
        }
      }
    })

    setPosts([...posts, ...newPost])
  }

  return (
    <>
      <main className={commonStyles.container}>
        <Header />
        
        <div className={styles.contentContainer}>

          {posts.map(post => (
            <Link href={`/post/${post.uid}`} key={post.uid}>
              <a>
                <strong>{post.data.title}</strong>
                <p>{post.data.subtitle}</p>

                <div>
                <span><HiOutlineCalendar />{post.first_publication_date}</span>
                <span><HiUser />{post.data.author}</span>
              </div>
              </a>
            </Link>
          ))}  
          {nextPage && (
            <button type='button' onClick={handleNextPage}>
              Carregar mais posts
            </button>
          )}
          
        </div>

      </main>
    </>
  );
}

export const getStaticProps: GetStaticProps = async () => {
  const prismic = getPrismicClient({});
  const postsResponse = await prismic.getByType('spacetraveling', {
    pageSize: 1,
  });

  const posts = postsResponse.results.map( post => {
    return {
      uid: post.uid,
      first_publication_date: post.first_publication_date,
      data: {
        title: post.data.title,
        subtitle: post.data.subtitle,
        author: post.data.author,
      }
    }
  });

  const postsPagination = {
    next_page: postsResponse.next_page,
    results: posts,
  }

  return {
    props: {
      postsPagination,
    }
  }
  // TODO
};
