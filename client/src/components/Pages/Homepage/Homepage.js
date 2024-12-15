import React, { useState, useContext, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useNavigate } from 'react-router-dom';
import "./Homepage.css";
// import personIcon from "./personicon.png";
import UserContext from '../../../context/UserContext';
import HeaderBar from '../../Others/HeaderBar';



function Homepage() {

    const navigate = useNavigate();
    const [posts, setPosts] = useState([]);
    const [post1, setPost1] = useState(null);
    const [post2, setPost2] = useState(null);
    const [post3, setPost3] = useState(null);
    const [post4, setPost4] = useState(null);
    const [post5, setPost5] = useState(null);
    const [post6, setPost6] = useState(null);
    const [post7, setPost7] = useState(null);
    const [post8, setPost8] = useState(null);
    const [remainingPosts, setRemainingPosts] = useState([])

    const { username, setUsername } = useContext(UserContext); // Access username and setUsername from context
    const [showLogoutButton, setShowLogoutButton] = useState(false);
    // let post1, post2, post3, post4, post5, post6;



    // const [loggedIn, setLoggedIn] = useState([]);

    useEffect(() => {
        // fetch the data
        // display it on "recent-boxing-news"

        const fetchPosts = async () => {
            try {

                const fetchedPosts = await fetch("http://localhost:5000/api/posts/"); 
                if (fetchedPosts.ok) {
                    const fetchedPostsJson = await fetchedPosts.json();

                    setPosts(fetchedPostsJson.rows);
                }
                else {
                    console.log("fetched posts not ok");
                }
            }
            catch (error) {
                console.log("Error setting posts equal to fetched posts : ", error);
            }
        };
        fetchPosts();
    }, []);

    useEffect(() => {

        const tempPosts = posts.slice(-8);


        if (tempPosts.length > 0) {
            // setPost1(tempPosts[0]);
            setPost1(tempPosts[tempPosts.length - 1]);


        }
        // if (tempPosts.length > 1) setPost2(tempPosts[1]);
        // if (tempPosts.length > 2) setPost3(tempPosts[2]);
        // if (tempPosts.length > 3) setPost4(tempPosts[3]);
        // if (tempPosts.length > 4) setPost5(tempPosts[4]);
        // if (tempPosts.length > 5) setPost6(tempPosts[5]);
        // if (tempPosts.length > 6) setPost7(tempPosts[6]);
        // if (tempPosts.length > 7) setPost8(tempPosts[7]);
        // if (posts.length > 8) {
        //     setRemainingPosts(posts.slice(0, -8)); // Exclude the last 8 posts
        // }

        if (tempPosts.length > 1) setPost2(tempPosts[tempPosts.length - 2]);
        if (tempPosts.length > 2) setPost3(tempPosts[tempPosts.length - 3]);
        if (tempPosts.length > 3) setPost4(tempPosts[tempPosts.length - 4]);
        if (tempPosts.length > 4) setPost5(tempPosts[tempPosts.length - 5]);
        if (tempPosts.length > 5) setPost6(tempPosts[tempPosts.length - 6]);
        if (tempPosts.length > 6) setPost7(tempPosts[tempPosts.length - 7]);
        if (tempPosts.length > 7) setPost8(tempPosts[tempPosts.length - 8]);
        if (posts.length > 8) {
            setRemainingPosts(posts.slice(0, -8)); // Exclude the last 8 posts
        }
    }, [posts]);



    const handleLPBClick = () => {
        try {
            navigate("/Login");
        } catch (error) {
            console.error("Error during navigating to CNP page :", error);
        }
    };

    const openLogoutButton = () => {
        setShowLogoutButton(true);
    };

    const logOut = () => {
        setUsername(null);
    };


    // get the last 6 posts
    return (
        <div>
            <div>

                <h1 id="recent-boxing-news">Recent Boxing News</h1>

                <div className="posts-container">
                    <div id="first-six-posts">
                        <div id="first-three-posts">
                            <div id="first-post">
                                {post1 ? (
                                    <div id="first-six-posts-image-and-title-wrapper">
                                        <img className="first-six-posts-post-image" src={post1.image_url} alt={post1.title} />
                                        <Link
                                            className="first-post-title"
                                            to={`/post/${post1.id}`}
                                            state={{ id: post1.id, title: post1.title, article_url: post1.article_url, image_url: post1.image_url }}
                                        >
                                            {post1.title}
                                        </Link>
                                    </div>
                                ) : (
                                    <p>Loading...</p>
                                )}
                            </div>

                            <div id="second-post">
                                {post2 ? (
                                    <div id="first-six-posts-image-and-title-wrapper">
                                        <img className="first-six-posts-post-image" src={post2.image_url} alt={post2.title} />

                                        <Link
                                            className="regular-post-titles"
                                            to={`/post/${post2.id}`}
                                            state={{ id: post2.id, title: post2.title, article_url: post2.article_url, image_url: post2.image_url }}
                                        >
                                            {post2.title}
                                        </Link>
                                    </div>
                                ) : (
                                    <p>Loading...</p>
                                )}
                            </div>

                            <div id="third-post">
                                {post3 ? (
                                    <div id="first-six-posts-image-and-title-wrapper">
                                        <img className="first-six-posts-post-image" src={post3.image_url} alt={post3.title} />

                                        <Link
                                            className="regular-post-titles"
                                            to={`/post/${post3.id}`}
                                            state={{ id: post3.id, title: post3.title, article_url: post3.article_url, image_url: post3.image_url }}
                                        >
                                            {post3.title}
                                        </Link>
                                    </div>
                                ) : (
                                    <p>Loading...</p>
                                )}
                            </div>
                        </div>
                        <div id="second-three-posts">
                            <div id="fourth-post">
                                {post4 ? (
                                    <div id="first-six-posts-image-and-title-wrapper">
                                        <img className="first-six-posts-post-image" src={post4.image_url} alt={post4.title} />

                                        <Link
                                            className="regular-post-titles"
                                            to={`/post/${post4.id}`}
                                            state={{ id: post4.id, title: post4.title, article_url: post4.article_url, image_url: post4.image_url }}
                                        >
                                            {post4.title}
                                        </Link>
                                    </div>
                                ) : (
                                    <p>Loading...</p>
                                )}
                            </div>
                            <div id="fifth-post">
                                {post5 ? (
                                    <div id="first-six-posts-image-and-title-wrapper">
                                        <img className="first-six-posts-post-image" src={post5.image_url} alt={post5.title} />

                                        <Link
                                            className="regular-post-titles"
                                            to={`/post/${post5.id}`}
                                            state={{ id: post5.id, title: post5.title, article_url: post5.article_url, image_url: post5.image_url }}
                                        >
                                            {post5.title}
                                        </Link>
                                    </div>
                                ) : (
                                    <p>Loading...</p>
                                )}
                            </div>
                            <div id="sixth-post">
                                {post6 ? (
                                    <div id="first-six-posts-image-and-title-wrapper">
                                        <img id="sixth-post-image" src={post6.image_url} alt={post6.title} />

                                        <Link
                                            className="regular-post-titles"
                                            to={`/post/${post6.id}`}
                                            state={{ id: post6.id, title: post6.title, article_url: post6.article_url, image_url: post6.image_url }}
                                        >
                                            {post6.title}
                                        </Link>
                                    </div>
                                ) : (
                                    <p>Loading...</p>
                                )}
                            </div>
                        </div>
                    </div>


                    <div id="third-two-posts">
                        <div class="box" id="box1">
                            <div id="seventh-post">
                                <div id="seventh-post-image">
                                    {
                                        post7 ? (
                                            <img id="seventh-post-image" src={post7.image_url} alt={post7.title} />
                                        ) : (
                                            <div></div>
                                        )
                                    }

                                </div>
                                <div id="seventh-post-link">
                                    {
                                        post7 ? (
                                            <Link
                                                id="seventh-post-link"
                                                to={`/post/${post7.id}`}
                                                state={{ id: post7.id, title: post7.title, article_url: post7.article_url, image_url: post7.image_url }}
                                            >
                                                {post7.title}
                                            </Link>
                                        ) : (<div></div>)
                                    }
                                </div>
                            </div>
                        </div>
                        <div class="box" id="box2">
                            <div id="eighth-post-image">
                                {
                                    post8 ? (
                                        <img id="eighth-post-image" src={post8.image_url} alt={post8.title} />
                                    ) : (
                                        <div></div>
                                    )
                                }

                            </div>
                            <div id="eighth-post-link">
                                {
                                    post8 ? (
                                        <Link
                                            id="eighth-post-link"
                                            to={`/post/${post8.id}`}
                                            state={{ id: post8.id, title: post8.title, article_url: post8.article_url, image_url: post8.image_url }}
                                        >
                                            {post8.title}
                                        </Link>
                                    ) : (<div></div>)
                                }
                            </div>
                        </div>
                    </div>
                    <div id="rest-of-posts">
                        <div id="rest-of-posts-dividing-line"></div>
                        <div id="rest-of-posts-posts">
                            {
                                remainingPosts ? (
                                    remainingPosts.map((post, index) => {
                                        return (
                                            <div id="remaining-post-post" key={index}>
                                                <img id="remaining-post-image" src={post.image_url} alt={post.title} />
                                                <Link
                                                    id="remaining-post-link"
                                                    to={`/post/${post.id}`}
                                                    state={{ id: post.id, title: post.title, article_url: post.article_url, image_url: post.image_url }}
                                                >
                                                    {post.title}
                                                </Link>
                                            </div>
                                        );
                                    })
                                ) : (
                                    <div>
                                        Loading...
                                    </div>
                                )
                            }

                        </div>
                    </div>
                </div>
            </div>
        </div>
    );

}

export default Homepage;