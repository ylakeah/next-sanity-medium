import { GetStaticProps } from "next";
import React, { useState } from "react";
import Header from "../../components/Header";
import { sanityClient, urlFor } from "../../sanity";
import { Post } from "../../typings";
import PortableText from "react-portable-text";
import { useForm, SubmitHandler } from "react-hook-form";

interface Props {
  post: Post;
}

interface IFormInput {
  _id: string;
  name: string;
  email: string;
  comment: string;
}

function Post({ post }: Props) {
  const [submitted, setsubmitted] = useState(false);

  console.log(post);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<IFormInput>();

  const onSubmit: SubmitHandler<IFormInput> = async (data) => {
    await fetch("/api/createComment", {
      method: "POST",
      body: JSON.stringify(data),
    })
      .then(() => {
        setsubmitted(true);
      })
      .catch((err) => {
        console.log(err);
        setsubmitted(false);
      });
  };

  return (
    <main>
      <Header />

      <img
        src={urlFor(post.mainImage).url()}
        className="w-full h-40 object-cover"
        alt=""
      />

      <article className="max-w-3xl mx-auto ">
        <h1 className="text-3xl mt-10 mb-3">{post.title}</h1>
        <h2 className="text-xl font-light text-gray-500">{post.description}</h2>

        <div className="flex items-center space-x-2 mt-5">
          <img
            className="w-10 h-10 rounded-full "
            src={urlFor(post.author.image).url()}
            alt=""
          />
          <p className="font-extralight text-sm">
            Blog post by{" "}
            <span className="text-green-500">{post.author.name}</span> -
            publihsed at {post._createdAt}
          </p>
        </div>

        <div className="mt-10">
          <PortableText
            className=""
            dataset={process.env.NEXT_PUBLIC_SANITY_DATASET}
            projectId={process.env.NEXT_PUBLIC_SANITY_PROJECT_ID}
            content={post.body}
          />
        </div>
      </article>

      <hr className="max-w-lg my-5 mx-auto border border-yellow-500" />

      {submitted ? (
        <div className="flex flex-col p-10 my-10 bg-yellow-500 text-white   max-w-2xl mx-auto">
          <h3 className="text-3xl font-bold">
            Thank you for submitting your comment!
          </h3>
          <p>once its been approved, it will show below!</p>
        </div>
      ) : (
        <form
          action=""
          onSubmit={handleSubmit(onSubmit)}
          className="flex flex-col p-5 mx-auto max-w-2xl mb-10"
        >
          <h2 className="text-xl text-bold mb-5">Leave a comment below!</h2>

          <input
            {...register("_id", { required: true })}
            type="hidden"
            value={post._id}
          />

          <label htmlFor="" className="block mb-5">
            <span className="text-gray-700">Name</span>
            <input
              {...register("name", { required: true })}
              className="shadow border rounded py-2 px-3 form-input block w-full "
              type="text"
              placeholder="john doe"
            />
          </label>
          <label htmlFor="" className="block mb-5">
            <span className="text-gray-700">Email</span>
            <input
              {...register("email", { required: true })}
              className="shadow border rounded py-2 px-3 form-input block w-full "
              type="email"
              placeholder="john.doe@mail.com"
            />
          </label>
          <label htmlFor="" className="block mb-5">
            <span className="text-gray-700">Comment</span>
            <textarea
              {...register("comment", { required: true })}
              className="shadow border rounded py-2 px-3 form-textarea mt-1 block w-full ring-yellow-500 "
              placeholder="Awesome content"
              rows={8}
            />
          </label>

          <input
            type="submit"
            className="bg-yellow-500 hover:bg-yellow-400 focus:shadow-outline focus:outline-none text-white font-bold py-2 px-4 rounded cursor-pointer  "
          />

          {/* errors will return when validation failed */}
          <div className="flex flex-col p-5">
            {errors.name && (
              <span className="text-red-500">The name field is required</span>
            )}

            {errors.email && (
              <span className="text-red-500">The email field is required</span>
            )}
            {errors.comment && (
              <span className="text-red-500">
                The comment field is required
              </span>
            )}
          </div>
        </form>
      )}

      {/* comments */}

      <div className="flex, flex-col p-10 my-10 max-w-2xl mx-auto shadow shadow-yellow-500 space-y-2">
        <h3 className="text-4xl">Comments</h3>
        <hr className="pb-2" />
        {post.comments.map((comment) => (
          <div key={comment._id}>
            <p>
              <span className="text-yellow-500">{comment.name}: </span>{" "}
              {comment.comment}
            </p>
          </div>
        ))}
      </div>
    </main>
  );
}

export default Post;

export const getStaticPaths = async () => {
  const query = `*[_type == "post"]{
    _id,
    slug{
      current
    }
  }`;

  const posts = await sanityClient.fetch(query);

  const paths = posts.map((post: Post) => ({
    params: {
      slug: post.slug.current,
    },
  }));

  return {
    paths,
    fallback: "blocking",
  };
};

export const getStaticProps: GetStaticProps = async ({ params }) => {
  const query = `*[_type == "post" && slug.current == $slug][0]{
    _id,
    _createdAt,
    title,
    author-> {
      name,
      image
    },
    'comments': *[
_type == "comment" && post._ref == ^._id && approved == true],
    description,
    mainImage,
    slug,
    body
  }`;

  const post = await sanityClient.fetch(query, {
    slug: params?.slug,
  });

  if (!post) {
    return {
      notFound: true,
    };
  }

  return {
    props: {
      post,
    },
    revalidate: 600, //after 600 seconds it'll update the old cache
  };
};
