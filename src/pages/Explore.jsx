import React from 'react'
import {Link} from 'react-router-dom'
import rentCategoryImage from '../assets/jpg/mercedesAmg.png'
import sellCategoryImage from '../assets/jpg/carshow2.jpg'
import Slider from '../Components/Slider'

function Explore() {
  return (
    <div className='explore'>
        <header>
          <p className='pageHeader'>Explore</p>
        </header>
        <main>
          <Slider/>
          <p className="exploreCategoryHeading">Categories</p>
          <div className="exploreCategories">
            <Link to='/category/rent'>
              <img src={rentCategoryImage} alt='rent' 
              className='exploreCategoryImg'/>
              <p className="exploreCategoryName">Cars for rent</p>
            </Link>
            <Link to='/category/sale'>
              <img src={sellCategoryImage} alt='sell' 
              className='exploreCategoryImg'/>
              <p className="exploreCategoryName">Cars for sale</p>
            </Link>
          </div>
        </main>
      
    </div>
  )
}

export default Explore
