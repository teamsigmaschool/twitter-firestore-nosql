import { createContext, useEffect, useState, useCallback } from "react";
import { auth,db } from "../firebase";
import {collection,doc,getDoc,getDocs,setDoc} from 'firebase/firestore'

export const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [posts,setPosts] = useState([])
  const [postsLoading, setPostsLoading] = useState(true)

  useEffect(() => {
    return auth.onAuthStateChanged((user) => {
      setCurrentUser(user);
      setLoading(false);
    });
  }, []);

  const fetchPostsByUser = useCallback(async (userId) => {
  setPostsLoading(true);
  try {
    const postsRef = collection(db, `users/${userId}/posts`);
    const querySnapshot = await getDocs(postsRef);
    const docs = querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
    setPosts(docs);
  } catch (error) {
    console.error(error);
  } finally {
    setPostsLoading(false);
  }
}, []);

const savePost = useCallback(async (userId, postContent) => {
  try {
    const postsRef = collection(db, `users/${userId}/posts`);
    const newPostRef = doc(postsRef);
    await setDoc(newPostRef, { content: postContent, likes: [] });
    const newPost = await getDoc(newPostRef);
    const post = {
      id: newPost.id,
      ...newPost.data(),
    };
    setPosts((prev) => [post, ...prev]);
  } catch (error) {
    console.error(error);
  }
}, []);

const likePost = useCallback(async (userId, postId) => {
  try {
    const postRef = doc(db, `users/${userId}/posts/${postId}`);
    const docSnap = await getDoc(postRef);

    if (docSnap.exists()) {
      const postData = docSnap.data();
      const likes = [...(postData.likes || []), userId];
      await setDoc(postRef, { ...postData, likes });

      setPosts((prev) =>
        prev.map((post) => (post.id === postId ? { ...post, likes } : post))
      );
    }
  } catch (error) {
    console.error(error);
  }
}, []);

const removeLikeFromPost = useCallback(async (userId, postId) => {
  try {
    const postRef = doc(db, `users/${userId}/posts/${postId}`);
    const docSnap = await getDoc(postRef);

    if (docSnap.exists()) {
      const postData = docSnap.data();
      const likes = (postData.likes || []).filter((id) => id !== userId);
      await setDoc(postRef, { ...postData, likes });

      setPosts((prev) =>
        prev.map((post) => (post.id === postId ? { ...post, likes } : post))
      );
    }
  } catch (error) {
    console.error(error);
  }
}, []);

const value = {
  currentUser,
  posts,
  postsLoading,
  fetchPostsByUser,
  savePost,
  likePost,
  removeLikeFromPost,
};


  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
}