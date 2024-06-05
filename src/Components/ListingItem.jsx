import React from 'react'
import {Link} from 'react-router-dom'
import {ReactComponent as DeleteIcon} from '../assets/svg/deleteIcon.svg'



function ListingItem({listing,id,onDelete}) {

  console.log(listing.imgUrl[0])
  return (
    
    <li className='categoryListing'>
        <Link to={`/category/${listing.type}/${id}`}
         className='categoryListingLink'>
           <img
           
          src={listing.imgUrl[0]}
          alt={listing.name}
          className='categoryListingImg'
        />
            <div className="categoryListingDetails">
                <p className="categoryListingLocation">
                    {listing.location}
                </p>
                <p className="categoryListingName">{listing.brand} {listing.model}</p>
                <p className="categoryListingName">{listing.year}</p>
                <p className="categoryListingPrice">
                    {listing.offer ? listing.discountedPrice : listing.price}
                    {listing.type === 'rent' && 'ILS/Day'}
                    
                </p>
   
                <div className="categoryListingInfoDiv">
                      
                    <p className="categoryListingInfoText">                       
                        {listing.seats} seats               
                    </p>
            
                      
                </div>
            </div>

        </Link>
        {onDelete && (
            <DeleteIcon className='removeIcon' fill='rgb(231,76,60)'
            onClick={()=> onDelete(listing.id,listing.brand)}/>
        )}

    </li>
  )
}

export default ListingItem
