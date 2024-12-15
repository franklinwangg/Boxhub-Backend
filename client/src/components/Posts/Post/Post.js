import React, { useState, useEffect, useContext } from 'react';
import { useLocation } from 'react-router-dom';
import Comment from '../Comment/Comment';
import UserContext from '../../../context/UserContext';
import "./Post.css";


const Post = () => {

    const location = useLocation();

    const [comments, setComments] = useState([]);
    const [articleContent, setArticleContent] = useState([]);
    const [articleImage, setArticleImage] = useState([]);

    const { username, setUsername } = useContext(UserContext);
    const [commentToPost, setCommentToPost] = useState("");
    const [isReadyToRender, setIsReadyToRender] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    

    useEffect(() => {
        const fetchAndSortComments = async () => {
            const fetchedComments = await fetchComments();
            const fetchedCommentsJson = fetchedComments.rows;

            const sortedComments = sortCommentsOnLevel(fetchedCommentsJson); // fetchedComments is not an array, it's an object
            setComments(sortedComments);
        };

        fetchAndSortComments();
        setIsReadyToRender(true);

        fetchArticle();
    }, []);

    const handleReplySubmission = async () => { 

        const fetchedComments = await fetchComments();
        setComments(fetchedComments.rows);
    };

    const handleSubmitCommentButton = async () => {

        if (username == null) {

        }
        else {

            const author = username;
            const comment = commentToPost;
            const idOfParentPost = location.state.id;

            setIsLoading(true);
            try {
                await fetch(`http://localhost:5000/api/comments/${idOfParentPost}`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        author: author,
                        comment: comment,
                        idOfParentPost: idOfParentPost,
                        level: 0
                    })
                });

                const fetchedComments = await fetchComments();

                // while we await it, have the button turn grey, and have a little swirling loading sign replace the text on the button
                setComments(fetchedComments.rows);
                setCommentToPost("");
            }
            catch (error) {
                console.log("uh oh! error is ", error);
            }
            finally {
                // setIsLoading(false);
                setTimeout(() => {
                    setIsLoading(false);

                    const newCommentElement = document.getElementById('new-comment');
                    if (newCommentElement) {
                        newCommentElement.scrollIntoView({ behavior: 'smooth' });

                        // Add the highlight class for the fade effect
                        newCommentElement.classList.add('highlight');
                    }
                }, 1000);


            }
        }
    };

    const changeCommentToPost = (event) => {
        setCommentToPost(event.target.value);
    };

    const fetchComments = async () => { // fetchComments returns undefined
        try {

            const postId = location.state.id; // this is null
            // const response = await fetch(`http://localhost:5000/api/comments/${postId}`); // where does this go?

            try {
                const response = await fetch(`http://localhost:5000/api/comments/${postId}`); // this is not defined

                if (!response.ok) {
                    // Endpoint does not exist or returned an error
                    console.log(`Error: ${response.status} - ${response.statusText}`);
                } else {
                    // Process response data if successful
                    const data = await response.json(); // response is not defined
                    return data;
                }
            } catch (error) {
                // Handle network or other errors
                console.error("Fetch failed:", error);
            }
        }
        catch (error) {
            console.log("Error fetching comments : ", error);
        }
    };

    const sortCommentsOnLevel = (dataComments) => {
        // sort the comments on order, so all 0's in front, then 1's, etc

        if (dataComments.length === 0) {
            return dataComments;
        }

        const sortedDataComments = dataComments.sort((firstComment, secondComment) => {
            if (firstComment.level > secondComment.level) {
                return 1;
            }
            else if (firstComment.level === secondComment.level) {
                return 0;
            }
            else return -1;
        });
        return sortedDataComments;
    }

    const divideCommentsIntoLevelArrays = () => {
        // first, separate comments into new Level arrays - one array for all Level0's, another for Level1's, etc

        // why does dCILA get called again when button is clicked?
        const levelArrays = [];
        var currLevel = 0;

        while (true) {

            const temp = comments.filter((comment) => { // comments isn't an array yet
                return comment.level === currLevel;
            });
            if (temp.length === 0) {

                break;
            }
            else {
                
                levelArrays.push(temp);
                currLevel++;
            }
        }
        return levelArrays;
    };

    const renderEachLevel = (levelArrays, currentComment, level) => {

        const renderedComments = [];
        const temp = [];
        // render itself

        renderedComments.push(renderComment(currentComment));

        // if comment is on last level of levelArrays, we need to stop it cuz otherwise will 
        // trigger outOfBounds error
        if (level === levelArrays.length - 1) {

            return renderedComments;
        }
        else {
            // find all matching child comments in next level
            for (let i = 0; i < levelArrays[level + 1].length; i++) {
                if (levelArrays[level + 1][i].parent_comment_id == currentComment.id) { // parentCommentId undefined?
                    temp.push(levelArrays[level + 1][i]);

                }
            }

            // render all of its child comments

            for (let i = 0; i < temp.length; i++) {
                const arrayOfChildElementsHTML = renderEachLevel(levelArrays, temp[i], level + 1);
                for (let j = 0; j < arrayOfChildElementsHTML.length; j++) {
                    renderedComments.push(arrayOfChildElementsHTML[j]);
                }
            }

            // if no children, then return renderedComments

            return renderedComments;
        }

        // 1) render itself

        // 2) make empty array
        // 3) go through next level array and add any posts whose parentComment matches postId to array
        // 4) for every element in array : 
        // 5) renderComment(postId, level + 1)

    };

    const renderComment = (comment) => {

        console.log("comment content : ", comment.content);

        return (

            // these are the props
            // <Comment post={location.state.id} author={comment.author} comment={comment.content} level={comment.level} id={comment.post_id}
            //     handleReplySubmission={handleReplySubmission} /> // id is undefined?
                <Comment post={location.state.id} comment_id = {comment.comment_id} post_id = {comment.post_id} 
                    author = {comment.author} content = {comment.content} level = {comment.level} 
                    parent_comment_id = {comment.parent_comment_id}
                handleReplySubmission={handleReplySubmission} /> // id is undefined?
     
            );
    };

    const renderComments = () => {
        if (comments.length === 0) {
        }
        else {
            const overallRenderedComments = [];
            const levelArrays = divideCommentsIntoLevelArrays(); // not an array

            for (let i = 0; i < levelArrays[0].length; i++) {
                const arrayOfRecursiveElementsHTML = renderEachLevel(levelArrays, levelArrays[0][i], 0);
                for (let j = 0; j < arrayOfRecursiveElementsHTML.length; j++) {
                    overallRenderedComments.push(
                        React.cloneElement(arrayOfRecursiveElementsHTML[j], { key: arrayOfRecursiveElementsHTML[j].props.id })
                    );
                }
            }
            return overallRenderedComments;
        }
    }

    const fetchArticle = async () => {
        const response1 = await fetch(location.state.article_url);
        const articleContents = await response1.json();

        setArticleContent(articleContents.content);

        try {
            // const response2 = await fetch(location.state.image_url);
   
            // const articleImageBlob = await response2.blob();
    
            // const articleImageUrl = URL.createObjectURL(articleImageBlob);
    
    
            // setArticleImage(articleImageUrl);
            
        }
        catch(error) {
            console.log("Error : ", error);
        }
    };

    return (
        <div>
            <div id="post-title-and-content-section">
                <div id="post-title-div">{location.state.title}</div>
                <div id="post-image-div">
                    {articleImage == null ? (
                        <div></div>
                    ) : (
                        // <img id = "article-image" src={articleImage} alt="Article Image" />

                        <img id="article-image" src={location.state.image_url} alt={location.state.title} />

                    )}
                </div>
                <div id="post-content-div">
                    {articleContent == null ? (
                        <div></div>
                    ) : (
                        <div>{articleContent}</div>
                    )}
                </div>
            </div>

            <input type="text" id="post-new-comment-box" value={commentToPost}
                placeholder="Post comment here" onChange={changeCommentToPost}></input>
            <button id="submit-comment-button" onClick={handleSubmitCommentButton}>
                {isLoading ?
                    (<div className="spinner"></div>)
                    : (<div>
                        Submit
                    </div>)}
            </button>

            <div id="comments-section-title">All Comments : {comments.length}</div>

            <div className="comments-section">
                {isReadyToRender ? renderComments() : <p>Loading comments...</p>}

                {/* {comments.map((comment, index) => (
                    <div
                        key={comment.id}
                        id={index === comments.length - 1 ? "new-comment" : null} 
                        className="comment"
                    >
                        {comment.content}
                    </div>
                ))} */}
            </div>
        </div>
    );

}

export default Post;