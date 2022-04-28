import { PostMutationReposive } from '../types/PostMutationReposive';
import {
  Arg,
  ID,
  Mutation,
  Query,
  Resolver,
  UseMiddleware,
} from 'type-graphql';
import { CreatePostInput } from '../types/CreatePostInput';
import { Post } from '../entities/Post';
import { UpdatePostInput } from '../types/UpdatePostInput';
import { checkAuth } from '../middleware/checkoutAuth';

@Resolver()
export class PostResolver {
  @Query((_return) => [Post], { nullable: true })
  async postList(): Promise<Post[] | null> {
    try {
      const postList = Post.find();
      return postList;
    } catch (error) {
      console.log(`Internall sever: `, error.message);
      return null;
    }
  }

  @Query((_return) => Post, { nullable: true })
  async postDetail(@Arg('id', (_type) => ID) id: number): Promise<Post | null> {
    try {
      const post = await Post.findOne({ where: { id } });
      return post;
    } catch (error) {
      console.log(`Internall sever: `, error.message);
      return null;
    }
  }

  @Mutation((_return) => PostMutationReposive, { nullable: true })
  @UseMiddleware(checkAuth)
  async craetePost(
    @Arg('createPostInut') createPostInput: CreatePostInput
  ): Promise<PostMutationReposive> {
    const { title, text } = createPostInput;
    try {
      const existPost = await Post.findOne({ where: [{ title }] });
      if (existPost) {
        return {
          code: 400,
          success: false,
          message: 'Post create failed!',
          error: [
            {
              field: 'Title',
              message: 'Title is already!',
            },
          ],
        };
      }
      let newPost = Post.create({
        title,
        text,
      });
      await newPost.save();
      return {
        code: 200,
        success: true,
        message: 'Post created successfully!',
        post: newPost,
      };
    } catch (error) {
      return {
        code: 500,
        success: false,
        message: `Internal server! ${error.message}`,
      };
    }
  }

  @Mutation((_return) => PostMutationReposive, { nullable: true })
  @UseMiddleware(checkAuth)
  async updatePost(
    @Arg('updatePostInput') updatePostInput: UpdatePostInput
  ): Promise<PostMutationReposive> {
    try {
      const { id, title, text } = updatePostInput;
      const postUpdate = await Post.findOne({ where: { id } });
      const postExist = await Post.findOne({ where: { title } });
      if (!postUpdate) {
        return {
          code: 400,
          success: false,
          message: 'Post not found!',
        };
      }

      if (postExist) {
        return {
          code: 400,
          success: false,
          message: 'Post already exists',
          error: [{ field: 'Title', message: 'Title is already!' }],
        };
      }
      postUpdate.title = title;
      postUpdate.text = text;
      await postUpdate.save();
      return {
        code: 200,
        success: true,
        message: 'Post updated successfully!',
        post: postUpdate,
      };
    } catch (error) {
      return {
        code: 500,
        success: false,
        message: 'Internal server error: ' + error.message,
      };
    }
  }

  @Mutation((_return) => PostMutationReposive, { nullable: true })
  @UseMiddleware(checkAuth)
  async deletePost(
    @Arg('id', (_type) => ID) id: number
  ): Promise<PostMutationReposive> {
    try {
      const postDelete = await Post.findOne({ where: { id } });
      if (!postDelete) {
        return {
          code: 400,
          success: false,
          message: 'Post is not found',
        };
      }

      await Post.delete(id);
      return {
        code: 200,
        success: true,
        message: 'Delete post successfully!',
        post: postDelete,
      };
    } catch (error) {
      return {
        code: 400,
        success: false,
        message: 'Internal server error: ' + error.message,
      };
    }
  }
}
