import { useNavigate } from 'react-router';
import {
    Box,
    Button,
    Typography,
    List,
    ListItem,
    ListItemText,
    Divider,
} from '@mui/material';
import { ArrowBack } from '@mui/icons-material';

import { HOME_PATHS } from '@/router/routes';

const HowToPlay = () => {
    const navigate = useNavigate();

    const navToHome = () => {
        navigate(HOME_PATHS.HOME.getResolvedPath());
    };

    return (
        <Box
            maxWidth="800px"
            minWidth="800px"
            margin="0 auto"
            padding="32px"
            display="flex"
            flexDirection="column"
            gap={4}
        >
            <Box position="relative">
                <Box position="absolute">
                    <Button
                        variant="outlined"
                        startIcon={<ArrowBack />}
                        onClick={navToHome}
                    >
                        Back to Home
                    </Button>
                </Box>
                <Typography variant="h1" align="center">
                    How to Play Deuces
                </Typography>
            </Box>

            <Box>
                <Typography variant="h2" gutterBottom>
                    Objective
                </Typography>
                <Typography>
                    Play all your cards before the other players.
                </Typography>
            </Box>

            {/* Gameplay */}
            <Box>
                <Typography variant="h2" gutterBottom>
                    Gameplay
                </Typography>
                <List dense>
                    <ListItem>
                        <ListItemText primary="The player with the 3♦ gets the left over card (if there is any) and goes first. He/she will start the round with a valid hand that includes the 3♦." />
                    </ListItem>
                    <ListItem>
                        <ListItemText primary="Going clockwise, the next player can either play a hand that matches and beats the previously played hand or pass. Once a player passes, they cannot rejoin the round." />
                    </ListItem>
                    <ListItem>
                        <ListItemText primary="The round ends when all players pass except one. The player that didn't pass can then start the next round with any valid hand." />
                    </ListItem>
                    <ListItem>
                        <ListItemText primary="Game ends when only one player has cards left. Players are ranked in the order they play all their cards." />
                    </ListItem>
                </List>
            </Box>

            <Box>
                <Typography variant="h2" gutterBottom>
                    Hand Types
                </Typography>

                <Typography gutterBottom>
                    There are five valid hand types in Deuces:
                </Typography>
                <List dense>
                    <ListItem>
                        <ListItemText primary="Single – one card" />
                    </ListItem>
                    <ListItem>
                        <ListItemText primary="Pair – two cards of the same rank" />
                    </ListItem>
                    <ListItem>
                        <ListItemText primary="Triple – three cards of the same rank" />
                    </ListItem>
                    <ListItem>
                        <ListItemText primary="Quads – four cards of the same rank" />
                    </ListItem>
                    <ListItem>
                        <ListItemText primary="Five-card hand – Similar too poker hands (see below)" />
                    </ListItem>
                </List>

                <Typography variant="subtitle1" gutterBottom>
                    Five-Card Hand Rankings (from lowest to highest):
                </Typography>
                <List dense>
                    <ListItem>
                        <ListItemText
                            primary="Straight – 5 consecutive ranks (e.g. 5-6-7-8-9), suits don’t matter."
                            secondary="Note that A-2-3-4-5 and 10-J-Q-K-A is a valid straight but J-Q-K-A-2 is not."
                        />
                    </ListItem>
                    <ListItem>
                        <ListItemText primary="Flush – 5 cards of the same suit, not in sequence." />
                    </ListItem>
                    <ListItem>
                        <ListItemText primary="Full House – 3 of a kind + a pair (e.g. 7♠ 7♥ 7♦ 9♣ 9♦)." />
                    </ListItem>
                    <ListItem>
                        <ListItemText primary="Four of a Kind – 4 cards of the same rank + any other card." />
                    </ListItem>
                    <ListItem>
                        <ListItemText primary="Straight Flush – 5 cards in sequence and same suit." />
                    </ListItem>
                </List>

                <Typography gutterBottom sx={{ mt: 2 }}>
                    The strength of a hand is determined by rank and suit:
                </Typography>
                <List dense>
                    <ListItem>
                        <ListItemText primary="Rank Order: 3 &lt; 4 &lt; ... &lt; K &lt; A &lt; 2" />
                    </ListItem>
                    <ListItem>
                        <ListItemText primary="Suit Order (low to high): Diamonds (♦) &lt; Clubs (♣) &lt; Hearts (♥) &lt; Spades (♠)" />
                    </ListItem>
                </List>

                <Typography gutterBottom sx={{ mt: 2 }}>
                    To determine which hand is stronger:
                </Typography>
                <List dense>
                    <ListItem>
                        <ListItemText
                            primary="Singles: compare the rank first, then the suit if ranks are equal."
                            secondary="e.g. 5♠ > 5♥ since Spades > Hearts."
                        />
                    </ListItem>

                    <ListItem>
                        <ListItemText
                            primary="Pairs: compare the rank first, then the highest suit among the pair."
                            secondary="e.g. 5♦, 5♠ > 5♣, 5♥ since 5♠ > 5♥."
                        />
                    </ListItem>

                    <ListItem>
                        <ListItemText primary="Triples and Quads: compare the rank of the group only." />
                    </ListItem>

                    <ListItem>
                        <ListItemText primary="Five-Card Hands: first compare hand type, then break ties based on specific rules below." />
                    </ListItem>

                    <ListItem sx={{ pl: 4 }}>
                        <ListItemText
                            primary="Straight: highest card rank determines the winner; suit of the highest card breaks ties if needed."
                            secondary="e.g. 5♣–6♦–7♦–8♥–9♠ beats 4♣–5♣–6♥–7♥–8♠. If both have 9-high, 9♠ beats 9♥."
                        />
                    </ListItem>

                    <ListItem sx={{ pl: 4 }}>
                        <ListItemText
                            primary="Flush: compare by suit first, then compare the highest card"
                            secondary="e.g. spades flush beats hearts flush; flush with 2♠–J♠–9♠–7♠–4♠ beats A♠–Q♠–10♠–3♠–5♠."
                        />
                    </ListItem>

                    <ListItem sx={{ pl: 4 }}>
                        <ListItemText
                            primary="Full House: compare the rank of the triple only."
                            secondary="e.g. 7♠–7♥–7♦–9♣–9♦ beats 6♠–6♥–6♦–A♣–A♦."
                        />
                    </ListItem>

                    <ListItem sx={{ pl: 4 }}>
                        <ListItemText
                            primary="Four of a Kind: compare the rank of the quads only."
                            secondary="e.g. 9♠–9♥–9♦–9♣–2♦ beats 8♠–8♥–8♦–8♣–A♠."
                        />
                    </ListItem>

                    <ListItem sx={{ pl: 4 }}>
                        <ListItemText
                            primary="Straight Flush: compare the suit first, then the highest card rank."
                            secondary="e.g. 5♠–6♠–7♠–8♠–9♠ (Spades) beats 5♥–6♥–7♥–8♥–9♥ (Hearts)."
                        />
                    </ListItem>
                </List>
            </Box>

            <Divider />

            <Typography align="center" color="text.secondary" fontSize="16px">
                Have fun and may the best Deuces player win!
            </Typography>
        </Box>
    );
};

export default HowToPlay;
