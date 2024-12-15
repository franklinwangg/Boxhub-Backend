
import React, { useState, useContext, useEffect, useRef } from 'react';
import "./Comment.css";
import { useLocation } from 'react-router-dom';

import UserContext from '../../../context/UserContext';
import Post from '../Post/Post';



const Comment = (props) => {
    const [replyCommentToPost, setReplyCommentToPost] = useState("");
    const [showReplyButton, setShowReplyButton] = useState(false);

    const { username, setUsername } = useContext(UserContext);
    const location = useLocation();

    const replyBoxRef = useRef(null);



    useEffect(() => {
        const handleClickOutside = (event) => {
            if (replyBoxRef.current && !replyBoxRef.current.contains(event.target)) {
                setShowReplyButton(false); // Hide reply box when clicking outside
            }
        };

        document.addEventListener('mousedown', handleClickOutside);

    

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    const changeReplyCommentToPost = (event) => {
        setReplyCommentToPost(event.target.value);
    };

    const handleClickReplyButton = () => {
        if(username == null) {

        }
        else {
            setShowReplyButton(true);
        }
    };

    const handleReplySubmission = () => {
        // Call the passed function

        props.handleReplySubmission();
    };

    const handleClickSubmitReplyButton = async (post) => {
        // print post?

        // {post: 'e3aace67-3f73-47b0-b49d-1e0d17e20b49', author: 'george', comment: '1', level: 0, id: undefined, …}
        
        const postId = props.post; 
        const commentId = props.comment_id; 
        // when i reply to comment #1, postId and commentId should match comment #1

        try {

                // <Comment post={location.state.id} comment_id = {comment.comment_id} post_id = {comment.post_id} 
                //     author = {comment.author} content = {comment.content} level = {comment.level} 
                //     parent_comment_id = {comment.parent_comment_id}
                // handleReplySubmission={handleReplySubmission} />

            const response = await fetch(`http://localhost:5000/api/comments/${postId}/${commentId}`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    comment_id : props.comment_id, 
                    post_id : props.post_id,
                    author : username, // needs to be your own author
                    content : replyCommentToPost, // needs to be your own content
                    level : props.level, 
                }),
            });

            if (response.ok) {
                handleReplySubmission();
                setReplyCommentToPost("");


            } else {
                console.error("Failed to post reply");
            }
        } catch (error) {
            console.error("Error posting reply:", error);
        }
    };

    return (
        <div className="comment-container" style={{ marginLeft: props.level * 20 + 'px' }}>
            <div className="comment-box">

                <div className="comment-author">    {props.author ? props.author.toUpperCase() : 'Anonymous'}
                </div>

                {/* <Comment post={location.state.id} comment_id = {comment.comment_id} post_id = {comment.post_id} 
                    author = {comment.author} content = {comment.content} level = {comment.level} 
                    parent_comment_id = {comment.parent_comment_id}
                handleReplySubmission={handleReplySubmission} /> // id is undefined? */}

                <div className="comment-contents">{props.content}</div> 

            </div>


            <div className="reply-section" ref={replyBoxRef}>
                {showReplyButton && (
                    <div>
                        <input
                            type="text"
                            className="reply-input"
                            value={replyCommentToPost}
                            placeholder="Reply to this comment..."
                            onChange={changeReplyCommentToPost}
                        />

                        {/* <button className="submit-reply-button" onClick={handleClickSubmitReplyButton}>
                            Submit
                        </button> */}
                        <button className="submit-reply-button" onClick={() => handleClickSubmitReplyButton()}>
                            <span className="reply-arrow">&#x21B5;</span>
                            Submit

                        </button>

                    </div>
                )
                }

                {!showReplyButton && (
                    <button className="reply-button" onClick={handleClickReplyButton}>
                        <span className="reply-arrow">&#x21B5;</span>
                        Reply
                    </button>
                )}

            </div>
        </div>
    );
};

export default Comment;
