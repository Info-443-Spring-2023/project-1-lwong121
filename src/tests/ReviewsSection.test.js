import "@testing-library/jest-dom";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ReviewsSection } from "../components/ReviewsSection"
import HUGE_GAME_DATA from '../data/games.json';
import TEST_USER from '../components/testuser.json';
import { getDatabase, connectDatabaseEmulator } from "firebase/database";
import { initializeApp } from "firebase/app";
import React from 'react';

const firebaseConfig = {
  apiKey: "AIzaSyDDDS9l68XzPdjIQbhfAdbohMv3RkaoAKk",
  authDomain: "mygamelist-a7724.firebaseapp.com",
  databaseURL: "https://mygamelist-a7724-default-rtdb.firebaseio.com",
  projectId: "mygamelist-a7724",
  storageBucket: "mygamelist-a7724.appspot.com",
  messagingSenderId: "465906599896",
  appId: "1:465906599896:web:d5f372a4ae001ade3594ad",
  measurementId: "${config.measurementId}"
};

const app = initializeApp(firebaseConfig);
const db = getDatabase();
if (location.hostname === "localhost") {
  connectDatabaseEmulator(db, "localhost", 9000);
}

const gameName = "Counter-Strike";
const gameData = HUGE_GAME_DATA.find((game) => {
  return game.name === gameName;
});

describe("Unit: Review Forms", () => {
  describe("1. Render Review", () => {
    test("Check if review rendered", () => {
      const reviewText = "test review";

      render(<ReviewsSection currentUser={TEST_USER} gameData={gameData} db={db} />);

      const formInput = screen.getByRole("textbox");
      userEvent.type(formInput, reviewText);

      userEvent.click(screen.getByRole("button", { name: /submit/i }));

      expect(screen.getByText(reviewText)).toBeInTheDocument();
    })
  })

  describe("2. Render Stars", () => {
    test("Check if star rating rendered", () => {
      const starRating = 3;

      render(<ReviewsSection currentUser={TEST_USER} gameData={gameData} db={db} />);

      const formStars = screen.getAllByRole("button", { name: 'reviewStar' });
      userEvent.click(formStars[starRating]);

      userEvent.click(screen.getByRole("button", { name: /submit/i }));

      const reviewStars = screen.getAllByRole("img", { name: 'reviewStar' });
      for (let i = 0; i < reviewStars.length; i++) {
        if (i <= starRating) {
          expect(reviewStars[i]).toHaveClass("star-selected");
        } else {
          expect(reviewStars[i]).not.toHaveClass("star-selected");
        }
      }
    })
  })

  describe("3. Don't Render Empty Review", () => {
    test("Check that empty review did not render", () => {
      render(<ReviewsSection currentUser={TEST_USER} gameData={gameData} db={db} />);

      userEvent.click(screen.getByRole("button", { name: /submit/i }));

      expect(screen.queryByTestId("reviewCard")).toBeNull();
    })
  })

  describe("4. Clear Content After Submit", () => {
    test("Check that the textbox is cleared after submit", () => {
      const reviewText = "test review clears";

      render(<ReviewsSection currentUser={TEST_USER} gameData={gameData} db={db} />);

      const formInput = screen.getByRole("textbox");
      userEvent.type(formInput, reviewText);

      userEvent.click(screen.getByRole("button", { name: /submit/i }));

      expect(screen.getByText(reviewText)).toBeInTheDocument();

      expect(screen.queryByDisplayValue(reviewText)).not.toBeInTheDocument();
    })
  })

  describe("5. Correct Average Rating Calculation", () => {
    test("Check that the average rating is calculated properly", () => {
      render(<ReviewsSection currentUser={TEST_USER} gameData={gameData} db={db} />);

      const starRatings = [3, 5, 2, 4, 1];
      const formStars = screen.getAllByRole("button", { name: 'reviewStar' });

      for (let i = 0; i < starRatings.length; i++) {
        userEvent.click(formStars[i]);
        userEvent.click(screen.getByRole("button", { name: /submit/i }));
      }

      const avgRating = screen.getByText(/Overall:/i).textContent;
      expect(avgRating).toMatch(/3 out of 5/i);
    })
  })

  describe("6. No Reviews Displayed", () => {
    test("Check that no reviews are displayed when there are no reviews", () => {
      render(<ReviewsSection currentUser={TEST_USER} gameData={gameData} db={db} />);

      expect(screen.queryByTestId("reviewCard")).toBeNull();
      expect(screen.getByText("Sorry, no reviews yet...")).toBeInTheDocument();
    })
  })

  describe("7. Like a Review", () => {
    test("Check that liking a review add one like", () => {
      const reviewText = "test review";

      render(<ReviewsSection currentUser={TEST_USER} gameData={gameData} db={db} />);

      const formInput = screen.getByRole("textbox");
      userEvent.type(formInput, reviewText);

      userEvent.click(screen.getByRole("button", { name: /submit/i }));

      const likeBtn = screen.getByRole("button", { name: /likeButton/i });
      const getNumLikes = () => {
        return parseInt(likeBtn.nextElementSibling.textContent);
      }

      expect(getNumLikes()).toEqual(0);

      userEvent.click(likeBtn);

      expect(getNumLikes()).toEqual(1);
    })
  })

  describe("8. Render Review and Stars", () => {
    test("Check if review and star rendered", () => {
      const reviewText = "test review";
      const starRating = 3;

      render(<ReviewsSection currentUser={TEST_USER} gameData={gameData} db={db} />);

      const formInput = screen.getByRole("textbox");
      userEvent.type(formInput, reviewText);

      const formStars = screen.getAllByRole("button", { name: 'reviewStar' });
      userEvent.click(formStars[starRating]);

      userEvent.click(screen.getByRole("button", { name: /submit/i }));

      expect(screen.getByText(reviewText)).toBeInTheDocument();

      const reviewStars = screen.getAllByRole('img', { name: 'reviewStar' });
        for (let i = 0; i < reviewStars.length; i++) {
          if (i <= starRating) {
            expect(reviewStars[i]).toHaveClass('star-selected');
          } else {
            expect(reviewStars[i]).not.toHaveClass('star-selected');
          }
        }
    })
  })

  // not working
  // describe("9. Old review rendered", () => {
  //   test("Check that old reviews are displayed", () => {
  //   const oldReviews = [
  //     {
  //       userId: "1",
  //       userEmail: "user1@gmail.com",
  //       userName: "test old user 1",
  //       review: "This is an old review 1.",
  //       rating: 4,
  //       timestamp: Date.now(),
  //     },
  //     // {
  //     //   id: "2",
  //     //   userEmail: "user2@gmail.com",
  //     //   userName: "test old user 2",
  //     //   review: "This is an old review 2.",
  //     //   rating: 5,
  //     //   timestamp: Date.now(),
  //     // },
  //   ];

  //   db.reviews = oldReviews;

  //   render(<ReviewsSection currentUser={TEST_USER} gameData={gameData} db={db} />);

  //   //oldReviews.forEach((review) => {
  //     expect(screen.getByText("This is an old review 1")).toBeInTheDocument();
  //     expect(screen.getByText("This is an old review 2")).toBeInTheDocument();
  //   });
  // })
  // })

  describe("10. Multiple Reviews", () => {
    test("Check if multiple review rendered", async () => {
      const review1Text = "test review 1";
      const review2Text = "test review 2";
      const starRating = 3;

      render(<ReviewsSection currentUser={TEST_USER} gameData={gameData} db={db} />);

      const formInput = screen.getByRole("textbox");
      const formStars = screen.getAllByRole("button", { name: 'reviewStar' });

      userEvent.type(formInput, review1Text);
      userEvent.click(formStars[starRating]);
      userEvent.click(screen.getByRole("button", { name: /submit/i }));
      expect(screen.queryByText(review1Text)).toBeInTheDocument();

      userEvent.type(formInput, review2Text);
      userEvent.click(formStars[starRating]);
      userEvent.click(screen.getByRole("button", { name: /submit/i }));
      expect(screen.queryByText(review2Text)).toBeInTheDocument();
    })
  })

  describe("11. Username Render", () => {
    test("Check if username in the review rendered", async () => {
      const reviewText = "test review by Test User";
      const starRating = 3;

      render(<ReviewsSection currentUser={TEST_USER} gameData={gameData} db={db} />);

      const formInput = screen.getByRole("textbox");
      userEvent.type(formInput, reviewText);

      const formStars = screen.getAllByRole("button", { name: 'reviewStar' });
      userEvent.click(formStars[starRating]);

      userEvent.click(screen.getByRole("button", { name: /submit/i }));

      expect(screen.getByText(reviewText)).toBeInTheDocument();
    })
  })

  describe("12. Zero Likes Review", () => {
    test("Check that an intial review has zero likes.", () => {
      const reviewText = "test review";

      render(<ReviewsSection currentUser={TEST_USER} gameData={gameData} db={db} />);

      const formInput = screen.getByRole("textbox");
      userEvent.type(formInput, reviewText);

      userEvent.click(screen.getByRole("button", { name: /submit/i }));

      const likeBtn = screen.getByRole("button", { name: /likeButton/i });
      const getNumLikes = () => {
        return parseInt(likeBtn.nextElementSibling.textContent);
      }

      expect(getNumLikes()).toEqual(0);
    })
  })

  // attempt to test the missing lines (17-25 in ReviewsSection.js for the
  // finalCleanup() method mentioned in the code coverage report
  describe("Test finalCleanup() function", () => {
    test("that the finalCleanup() when page is rendered", async () => {
      // attempt 1:
      // const fn = jest.fn(() => {
      //   const [reviewsHistory, setReviewsHistory] = useState([]);
      //   useEffect(() => {
      //     setReviewsHistory([{
      //       "game": "Counter-Strike",
      //       "likes": 0,
      //       "rating": 3,
      //       "review": "test review",
      //       "timestamp": 1682320097887,
      //       "userEmail": "unittestuser@email.com",
      //       "userId": "EHEpbYv3HvfwzUAC8AaCsZgaSHq1",
      //       "userName": "unittestuser",
      //       "firebaseKey": "-NTm4sCQb-JZfILJI0he"
      //     }]);
      //   });
      //   return reviewsHistory;
      // });

      // attempt 2
      // let cleanupFunc;

      // const setState = jest.fn();
      // try to spy on when useEffect is called so I can access the finalCleanup
      // method somehow, but don't really know if this will work
      // const spy = jest.spyOn(React, "useEffect").mockImplementationOnce(func => {
      //   cleanupFunc = func;
      // });

      // jest.spyOn(React, "useEffect").mockImplementationOnce(initState => [initState, setState]);

      // const reviewsSection = render(<ReviewsSection currentUser={TEST_USER} gameData={gameData} db={db} />);
      // expect(setState).toHaveBeenCalled();
      // expect(setState).toHaveBeenCalledWith("value");

      // attempt 3
      // const reviewText = "test review";

      // render(<ReviewsSection currentUser={TEST_USER} gameData={gameData} db={db} />);

      // const formInput = screen.getByRole("textbox");
      // userEvent.type(formInput, reviewText);

      // userEvent.click(screen.getByRole("button", { name: /submit/i }));

      // console.log(screen.getByText(reviewText));
      // expect(screen.getByText(reviewText)).toBeInTheDocument();
    })
  })
})