import { Dispatch, MutableRefObject, SetStateAction, useContext, useEffect, useState } from 'react'
import { Follower, Guide } from '../../types';
import { Avatar, Box, ListItem, ListItemAvatar, ListItemButton, ListItemText, TextField } from '@mui/material';
import { ListChildComponentProps } from 'react-window';
import { FixedSizeList } from "react-window";
import AddFollowersModal from '../modals/AddFollowersModal/AddFollowersModal';
import AccountCircleIcon from "@mui/icons-material/AccountCircle";
import { userContext } from '../../../Requisitions/context/userContext';


interface props {
  guide: Guide;
  guidesReference: MutableRefObject<Guide[] | undefined>;
  setChangeWasMade: Dispatch<SetStateAction<boolean>>;
}
const OpportunityFollowers = ({
  guide,
  guidesReference,
  setChangeWasMade,
}: props) => {
  const [followers, setFollowers] = useState<Follower[]>([]);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [filteredFollowers, setFilteredFollowers] = useState<Follower[]>([]);
  const { user } = useContext(userContext);

  useEffect(() => {
    if (guide.fields[0].data && guidesReference.current && user) {
      const userInFollowersList = [...guide.fields[0].data].find(
        (follower: Follower) => follower.codpessoa === user.CODPESSOA
      );
      if (!userInFollowersList) {
        const userFollower = {
          id_seguidor_projeto: 0,
          id_projeto: guidesReference.current[0].fields[0].data,
          codpessoa: user.CODPESSOA,
          ativo: 1,
          nome: user.NOME,
        };
        guide.fields[0].data = [...guide.fields[0].data, userFollower];
        guidesReference.current[4] = guide;
      }
      setFollowers([...guide.fields[0].data]);
      setFilteredFollowers([...guide.fields[0].data]);
    }
  }, [guide]);

  useEffect(() => {
    const filtered = followers.filter((follower) =>
      follower.nome.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredFollowers(filtered);
  }, [searchTerm, followers]);

  useEffect(() => {
    setFilteredFollowers(followers);
  }, [followers]);

  const Row = (props: ListChildComponentProps) => {
    const { index, style, data } = props;
    return (
      <ListItem
        style={{
          ...style,
          borderRadius: 10,
        }}
        key={index}
        component="div"
        disablePadding
      >
        <ListItemAvatar>
          <Avatar>
            <AccountCircleIcon />
          </Avatar>
        </ListItemAvatar>
        <ListItemButton>
          <ListItemText primary={`${data.nome}`} />
        </ListItemButton>
      </ListItem>
    );
  };

  return (
    <Box sx={{ width: "100%", padding: 1 }}>
      <AddFollowersModal
        setFollowers={setFollowers}
        followers={followers}
        guide={guide}
        guidesReference={guidesReference}
        setChangeWasMade={setChangeWasMade}
      />
      <TextField
        variant="outlined"
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        margin="normal"
        InputProps={{
          sx: { borderRadius: 10, height: 40 },
          placeholder: "busque por nome...",
        }}
      />
      <FixedSizeList
        height={300}
        itemCount={filteredFollowers.length}
        itemSize={50}
        width="100%"
      >
        {({ index, style }) => (
          <Row index={index} style={style} data={filteredFollowers[index]} />
        )}
      </FixedSizeList>
    </Box>
  );
};

export default OpportunityFollowers