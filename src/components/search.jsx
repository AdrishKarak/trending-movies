import React from "react";

function Search({searchTerm, setSearchTerm}) {
    return(
        <div className="search">

<div>
    <img src="search.svg" alt="search icon"/>
    <input
    type="text"
    placeholder="Search for movies"
    value={searchTerm}
    onChange={(event) => setSearchTerm(event.target.value)}/>

</div>
        </div>
    )
}
export default Search;