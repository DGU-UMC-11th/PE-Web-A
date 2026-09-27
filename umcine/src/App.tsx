
// function Header() {
//   return <h1>영화 목록</h1>;
// }

// function MovieCard() {
//   return (
//     <article>
//       <h2>오디세이</h2>
//       <p>2026.08.05</p>
//     </article>
//   );
// }

// function MovieList() {
//   return (
//     <section>
//       <MovieCard />
//       <MovieCard />
//     </section>
//   );
// }

// export default function App() {
//   return (
//     <main>
//       <Header />
//       <MovieList />
//     </main>
//   );
// }
//app
    // Header
    // MovieList
    //     MovieCard1
    //     MovieCard2

//미니실습4
// interface MovieCardProps {
//   title: string;
//   releaseDate: string;
//   isBookmarked: boolean;
// }

// function MovieCard({
//   title,
//   releaseDate,
//   isBookmarked,
// }: MovieCardProps) {
//   return (
//     <article>
//       <h2>{title}</h2>
//       <p>{releaseDate}</p>
//       <p>{isBookmarked ? "북마크됨" : "북마크 안 됨"}</p>
//     </article>
//   );
// }

// export default function App() {
//   return (
//     <main>
//       <MovieCard
//         title="오디세이"
//         releaseDate="2026.08.05"
//         isBookmarked={true}
//       />
//       <MovieCard
//         title="토이 스토리 5"
//         releaseDate="2026.06.17"
//         isBookmarked={false}
//       />
//       <MovieCard
//         title="인셉션 2"
//         releaseDate="2026.08.07"
//         isBookmarked={false}
//       />
//     </main>
//   );
// }


//미니실습 5
// interface Movie {
//   id: number;
//   title: string;
//   releaseDate: string;
// }

// const movies: Movie[] = [
//   { id: 1, title: "오디세이", releaseDate: "2026.08.05" },
//   { id: 2, title: "토이 스토리 5", releaseDate: "2026.06.17" },
//   { id : 3, title : "인셉션 2",releaseDate: "2026.08.07" }
// ];

// export default function App() {
//   return (
//     <main>
//       <h1>영화 목록</h1>
//       {movies.length === 0 ? (
//         <p>표시할 영화가 없어요.</p>
//       ) : (
//         <ul>
//           {movies.map((movie) => (
//             <li key={movie.id}>
//               {movie.title} - {movie.releaseDate}
//             </li>
//           ))}
//         </ul>
//       )}
//     </main>
//   );
// }

//미니실습 6
// import { useState } from "react";

// export default function App() {
//   const [count, setCount] = useState(0);

//   return (
//     <main>
//       <h1>카운터</h1>
//       <p>현재 값: {count}</p>

//       <button
//         onClick={() => setCount((current) => current + 1)}
//         disabled={count >= 5}
//       >
//         +1
//       </button>

//       <button
//         onClick={() => setCount((current) => current - 1)}
//         disabled={count <= 0}
//       >
//         -1
//       </button>

//       <button onClick={() => setCount(0)}>
//         초기화
//       </button>
//     </main>
//   );
// }


// import { useState } from "react";

// interface Movie {
//   id: number;
//   title: string;
//   releaseDate: string;
//   isBookmarked: boolean;
// }

// // MovieCard가 부모에게 전달받을 데이터와 함수
// interface MovieCardProps {
//   movie: Movie;
//   onToggleBookmark: (movieId: number) => void;
// }

// const initialMovies: Movie[] = [
//   {
//     id: 1,
//     title: "오디세이",
//     releaseDate: "2026.08.05",
//     isBookmarked: true,
//   },
//   {
//     id: 2,
//     title: "토이 스토리 5",
//     releaseDate: "2026.06.17",
//     isBookmarked: false,
//   },
// ];

// // 자식 컴포넌트
// function MovieCard({ movie, onToggleBookmark }: MovieCardProps) {
//   return (
//     <li>
//       <h2>{movie.title}</h2>
//       <p>개봉일: {movie.releaseDate}</p>
//       <button
//         type="button"
//         aria-pressed={movie.isBookmarked}
//         onClick={() => onToggleBookmark(movie.id)}
//       >
//         {movie.isBookmarked ? "북마크 해제" : "북마크 추가"}
//       </button>
//     </li>
//   );
// }

// // 부모 컴포넌트
// export default function App() {
//   const [movies, setMovies] = useState(initialMovies);

//   function handleToggleBookmark(movieId: number) {
//     setMovies((currentMovies) =>
//       currentMovies.map((movie) =>
//         movie.id === movieId
//           ? { ...movie, isBookmarked: !movie.isBookmarked }
//           : movie
//       )
//     );
//   }

//   return (
//     <main>
//       <h1>영화 목록</h1>
//       <ul>
//         {movies.map((movie) => (
//           <MovieCard
//             key={movie.id}
//             movie={movie}
//             onToggleBookmark={handleToggleBookmark}
//           />
//         ))}
//       </ul>
//     </main>
//   );
// }


//미니실습8
// import { createContext, useContext, useState } from "react";

// type StudyMode = "focus" | "break";

// const StudyModeContext = createContext<StudyMode>("focus");

// function StudyStatus() {
//   const mode = useContext(StudyModeContext);

//   return (
//     <p>현재 모드: {mode}</p>
//   );
// }

// export default function App() {
//   const [mode, setMode] = useState<StudyMode>("focus");

//   function handleToggleMode() {
//     setMode((currentMode) =>
//       currentMode === "focus" ? "break" : "focus"
//     );
//   }

//   return (
//     <StudyModeContext value={mode}>
//       <main>
//         <h1>스터디 모드</h1>
//         <StudyStatus />
//         <button onClick={handleToggleMode}>
//           모드 변경
//         </button>
//       </main>
//     </StudyModeContext>
//   );
// }

//필수미션

import { useState } from "react";
import Header from "./components/header";
import MovieGrid from "./components/movie-grid";
import Pagination from "./components/pagination";
import { movies as initialMovies } from "./data/movies";
import "./App.css";

export default function App() {
  const [movies, setMovies] = useState(initialMovies);

  function handleToggleBookmark(movieId: number) {
    setMovies((currentMovies) =>
      currentMovies.map((movie) =>
        movie.id === movieId
          ? {
              ...movie,
              isBookmarked: !movie.isBookmarked,
            }
          : movie
      )
    );
  }

  return (
    <>
      <Header />

      <main className="main-content">
        <h1 className="page-title">영화 목록</h1>

        <MovieGrid
          movies={movies}
          onToggleBookmark={handleToggleBookmark}
        />

        <Pagination />
      </main>
    </>
  );
}
