import React from "react";
import { Link, Route, Routes } from "react-router-dom";
import FanficDetail from "./components/FanficDetail";
import ReadingList from "./components/ReadingList";
import SearchPage from "./components/SearchPage";
import Settings from "./components/Settings";

const App: React.FC = () => {
	return (
		<div>
			{/* Navigation */}
			<nav>
				<Link to="/">Search</Link>
				<Link to="/reading-list">Reading List</Link>
				<Link to="/settings">Settings</Link>
			</nav>

			{/* Routing */}
			<Routes>
				<Route path="/" element={<SearchPage />} />
				<Route path="/fanfic/:id" element={<FanficDetail />} />
				<Route path="/reading-list" element={<ReadingList />} />
				<Route path="/settings" element={<Settings />} />
			</Routes>
		</div>
	);
};

export default App;
