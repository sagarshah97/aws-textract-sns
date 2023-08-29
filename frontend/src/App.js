import Textract from "./views/Textract/index";
import { AppBar, Toolbar, Typography } from "@mui/material";
import icon from "./assets/icon.png";

const App = () => {
  return (
    <>
      <AppBar position="static">
        <Toolbar>
          <Typography
            variant="h6"
            component="div"
            sx={{
              flexGrow: 1,
              display: "flex",
              alignItems: "center",
            }}
          >
            <img
              src={icon}
              height="30px"
              width="30px"
              style={{
                paddingRight: "1%",
                filter:
                  "invert(100%) sepia(4%) saturate(2%) hue-rotate(232deg) brightness(112%) contrast(100%)",
              }}
            />
            EASY CLAIM
          </Typography>
        </Toolbar>
      </AppBar>
      <Textract />
    </>
  );
};

export default App;
