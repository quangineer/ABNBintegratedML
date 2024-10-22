import React from 'react'
import { categories } from '../data';
import "../styles/Categories.scss";
import { Link } from 'react-router-dom';

const Categories = () => {
    return (
        <div className='categories'>
            <h1>Explore Top categories</h1>
            <p>
                Discover a variety of vacation rentals that cater to all types of travelers. 
                Focus on your experience, enjoy your life, and create unforgettable memories 
                in your own land.
            </p>

            <div className='categories_list'>
                {categories?.slice(1,7).map((category, index) => (
                    <Link to={`/properties/category/${category.label}`}>
                        <div className='category' key={index}>
                            <img src={category.img} alt={category.label} />
                            <div className='overlay'></div>
                            <div className='category_text'>
                                <div className='category_text_icon'>{category.icon}</div>
                                <p>{category.label}</p>
                            </div>
                        </div>
                    </Link>
                ))}
            </div>
        </div>
    )
}

export default Categories