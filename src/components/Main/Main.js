import React from 'react'
import './Main.css'
import UserContext from '../../Contexts/UserContext'
import SwipeService from '../../services/swipe-service'
import { Link } from 'react-router-dom'
import userSVG from '../../images/user.svg'
import nintendoLogo from '../../images/nintendo_logo.png'
import playstationLogo from '../../images/playstation_color_png.png'
import PC_Logo from '../../images/PC_Keyboard_Mouse_Icon.png'
import xboxLogo from '../../images/xbox_logo_png.png'
import checkmarkSVG from '../../images/checkmark-circle-2.svg'
import x_markSVG from '../../images/x-circle.svg'
import down_caretSVG from '../../images/solid_caret-down.svg'
import Queue from '../../Utils/Queue'
import { Swipeable } from 'react-swipeable'
import { Animate } from './mainAnimate'
import chatBlack from '../../images/chatblack.svg'


export default class MainPage extends React.Component {
    state = {
        queue: null,
        expanded: false,
        error: null,
        loading: false, // will be implemented when we add loading after swipe
    }

    static contextType = UserContext;

    componentDidMount() {
        SwipeService.getPotentialMatches(this.context.user_id)
            .then(potentialMatches => {
                const queue = new Queue();
                potentialMatches.queue.forEach(match => {
                    queue.enqueue(match);
                });
                this.setState({ queue });
            })
            .catch(error => this.setState({error: error.message}));

        document.addEventListener('keydown', (e) => {
            if(e.keyCode === 37) {
                this.swipeLeft();
            } else if(e.keyCode === 39) {
                this.swipeRight();
            }
        }, false);
    }

    componentWillUnmount() {
        document.removeEventListener('keydown', (e) => {
            if(e.keyCode === 37) {
                this.swipeLeft();
            } else if(e.keyCode === 39) {
                this.swipeRight();
            }
        }, false);
    }

    toggleExpanded = () => {
        this.setState({ expanded: this.state.expanded ? false : true })
    }

    swipeLeft = () => {
        const { queue } = this.state;
        
        const rejection = queue.dequeue();

        if(rejection.id) {
            SwipeService.addRejection(this.context.user_id, rejection.id)
                .then(() => {
                    this.setState({ queue, expanded: false })
                })
                .catch(error => this.setState({ error }))
        }
    }

    swipeRight = () => {
        const { queue } = this.state;
        const match = queue.dequeue();

        if(match.id) {
            SwipeService.addMatch(this.context.user_id, match.id)
                .then(() => {
                    this.setState({ queue, expanded: false });
                })
                .catch(error => this.setState({error}));
        }
    }

    generateUserCard = (user) => {
        const handlers = {
            onSwipedLeft: () => this.swipeLeft(),
            onSwipedRight: () => this.swipeRight(),
            preventDefaultTouchmoveEvent: false,
            trackMouse: true,
            delta: 160,
        }

        if (user.bio === null || user.bio === '') user.bio = 'No Bio';
        if (user.lfm_in === null || user.lfm_in === '') user.lfm_in = 'None';

        return (
            <>
            <Swipeable {...handlers} className='Swipeable__div'>
                <Animate>
                <div className='main__Swipe-User' onClick={this.toggleExpanded} aria-live='polite'>
                    <section className='minViewInfo'>
                    {this.state.expanded ? (<img src={user.avatar} alt='avatar' 
                    className='main__Image main__hidden-img' />) : 
                    (<img src={user.avatar} alt='avatar' className='main__Image' />)}
                    <h3 className='main__display-name'>{user.display_name}</h3>
                    </section>
                    <section className='main__bottom-card'>
                        <h4 className='main__card-header'>Platforms</h4>
                        <div className='main__platforms'>
                            {user.platforms.length === 0 ? <p className='main__none'>None</p> : null}
                            {user.platforms.includes("PC") ? <img className='main__PC' src={PC_Logo} alt='PC logo' /> : null}
                            {user.platforms.includes("Nintendo") ? <img className='main__nintendo' src={nintendoLogo} alt='Nintendo logo' /> : null}
                            {user.platforms.includes("Xbox") ? <img className='main__xbox' src={xboxLogo} alt='Xbox logo' /> : null}
                            {user.platforms.includes("PlayStation") ? <img className='main__playstation' src={playstationLogo} alt='Playstation logo' /> : null}
                        </div>
                        <h4 className='main__card-header'>LFM</h4>
                            {this.context.generateLfmElements(user.lfm_in)}
                        {this.state.expanded ? (<>
                            <h4 className='main__card-header'>Genres</h4>
                            <span className='main__genres'>{this.context.generateGenreString(user.genres)}</span>
                            <h4 className='main__card-header'>Bio</h4>
                            <p className='main__bio'>{user.bio}</p></>)
                            :
                            (<><h4 className='main__card-header main__hidden-text'>Bio</h4>
                            <p className='main__bio main__hidden-text'>{user.bio}</p></>)}
                        <div className='main__caret-container'>
                            <input className={`main__down-caret${this.state.expanded ? ' reverse' : ''}`} type="image" src={down_caretSVG} alt='down-caret' />
                        </div>
                    </section>
                </div>
                </Animate>
            </Swipeable>
            <div className='main__Second-Nav'>
                <img className='main__x' src={x_markSVG} alt='x' onClick={this.swipeLeft} />
                <img className='main__check' src={checkmarkSVG} alt='checkmark' onClick={this.swipeRight} />
            </div>
            </>
        )
    }

    generateNullCard = () => {
        return (
            <>
                <div className='main__Swipe-User-null'>
                    <h4 className='main__card-null'>You've reached the end of the user queue! While you're waiting for potential matches, you may find use in this <a href='https://store.steampowered.com/tags/en/Singleplayer/' rel='noopener noreferrer' target='_blank'>list of games.</a></h4>
                </div>
                <div className='main__Second-Nav'>
                </div>
            </>
        )
    }

    render() {
        const { queue } = this.state;

        if(queue == null || this.state.loading === true) {
            return (
                <div className="lds-roller"><div></div><div></div>
                <div></div><div></div><div></div><div>
                </div><div></div><div></div></div>
            )
        }

        const userOne = queue.isEmpty() ? null : queue.peek();

        return (
            <section className='main__Swipe'>
                <div className='main__Nav'>
                    <Link to='/profile'>
                        <img className='main__profile-button' src={userSVG} alt='profile' />
                    </Link>
                    <Link to='/matches'>
                        <img className='main__contacts-button' src={chatBlack} alt='contacts' />
                    </Link>
                </div>
                {userOne ? this.generateUserCard(userOne) : this.generateNullCard()}
            </section>
        )
    }
}