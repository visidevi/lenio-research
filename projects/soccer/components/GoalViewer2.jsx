import React, { useState, useCallback, Fragment, useEffect } from "react";
import PropTypes from "prop-types";
import ReactPlayer from "react-player";
import {
  Paragraph,
  ChartTitle,
  Subtitle,
  Title,
  GridInformation,
  SmallParagraph,
  Button,
  Input,
  GetContainer,
  ButtonGetLatest,
  LabelSearch,
  LabelContainer,
  Form
} from "../soccer.style";
import { SoccerField } from "./SoccerField";
import jwt from "jsonwebtoken";

export const GoalViewer = () => {
  const host = "http://localhost:8000"; //"https://soccer-api.leniolabs.com/";
  const [goal, setGoal] = useState({});

  const [secretWord, setSecretWord] = useState("");
  const [field, setField] = useState("received");
  const [searchGoal, setSearchGoal] = useState("");

  const information = ["received", "shot"];

  const getGoal = async (endpoint) => {
    if (!secretWord) {
      setSecretWord("admin");
      alert("Please enter a valid secret word");
    }
    if (secretWord) {
      const token = jwt.sign({ payload: {} }, secretWord);
      await fetch(`${host}/${endpoint}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer " + token
        }
      })
        .then((response) => response.json())
        .then((data) => {
          if (data && Object.keys(data).length > 0) {
            setGoal(data);
            setField(information[0]);
          }
        })
        .catch(() => {
          alert("Error: please contact administrator");
        });
    }
  };

  const onSaveGoal = async () => {
    if (!secretWord) {
      // alert("Please enter a valid secret word");
      setSecretWord("secret");
    }
    if (secretWord) {
      const token = jwt.sign({ payload: goal }, secretWord);
      alert(token);
      console.log(token, goal);
      await fetch(`${host}/messi/update/${goal.id}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer " + token
        },
        body: JSON.stringify(goal)
      })
        .then((response) => response.json())
        .catch(() => {
          alert("[Error] Catch: please contact administrator");
        });
      await getGoal("messi/latest-to-fill");
    }
  };

  const onClickField = useCallback(
    (coords) => {
      setGoal({
        ...goal,
        [field]: coords
      });
      setField("shot");
    },
    [field, goal]
  );

  useEffect(() => {
    // Client Side Render
    window
      .fetch(`${host}/messi/latest-to-fill`)
      .then((response) => response.json())
      .then((data) => {
        if (data) setGoal(data);
      })
      .catch(console.error);
  }, []);

  return (
    <Fragment>
      <div style={{ gridArea: "field" }}>
        <SoccerField onClick={(coords) => onClickField(coords)} field={field} goal={goal} />
      </div>
      <div style={{ gridArea: "data", maxWidth: 400 }}>
        {goal && (
          <>
            <Title>
              #{goal.id ? `${goal.id} |` : "No info"} {goal.Date}
            </Title>
            <Subtitle style={{ textAlign: "start" }}>Minute {goal.Minute}</Subtitle>
            <Paragraph>vs: {goal["Team"]}</Paragraph>
            <Paragraph>Goles: {goal["goles"]}</Paragraph>
            <Paragraph>Status Game: {goal["PartialStatus"]}</Paragraph>
            <Paragraph>Assist by: {goal["Assist"]}</Paragraph>
            <Paragraph>Type of goal: {goal["Type of goal"]}</Paragraph>
            <Paragraph>Tournament: {goal["Tournament"]}</Paragraph>
            <Paragraph>
              Final game result: <b> Argentina {goal["Result"]}</b>
            </Paragraph>
            <GridInformation>
              {information.map((info) => (
                <div key={info}>
                  <input
                    type="radio"
                    id={info}
                    name={info}
                    checked={info === field}
                    onChange={() => setField(info)}
                  />
                  <ChartTitle onClick={() => setField(info)}>{info}:</ChartTitle>
                  {goal[info] ? (
                    <>
                      {goal[info].map((goal) => (
                        <SmallParagraph key={goal}>{goal}</SmallParagraph>
                      ))}
                    </>
                  ) : (
                    <SmallParagraph style={{ fontStyle: "italic" }}>
                      Missing information
                    </SmallParagraph>
                  )}
                </div>
              ))}
            </GridInformation>
          </>
        )}
        <Paragraph>
          {`URL: `}
          <a href="https://youtu.be/a1-iff3lh2U" rel="noopener noreferrer" target="_blank">
            {goal["video"]}
          </a>
          <div>
            <h2>NextJs VideoPlayer - GeeksforGeeks</h2>
            <ReactPlayer url={goal["video"]} width="450px" height="200px" controls={true} />
          </div>
        </Paragraph>
        <LabelContainer>
          <label htmlFor={"secret word"}>
            Enter secret word: {secretWord}
            <Input
              onChange={({ target: { value } }) => {
                setSecretWord(value);
              }}
              value={secretWord}
              type="text"
              id="word-secret"
              name="word-secret"
            />
          </label>
        </LabelContainer>
        <GetContainer>
          <ButtonGetLatest
            onClick={() =>
              getGoal(searchGoal ? `messi/getId/${searchGoal}` : "messi/latest-to-fill")
            }>
            {searchGoal ? "Search" : "Get latest to fill"}
          </ButtonGetLatest>
          <Form>
            <LabelSearch htmlFor={"search goal"}>
              or search for goal #
              <Input
                onChange={({ target: { value } }) => setSearchGoal(value)}
                value={searchGoal}
                type="number"
                id="search"
                name="search"
              />
            </LabelSearch>
          </Form>
        </GetContainer>

        <GridInformation>
          <Button onClick={() => onSaveGoal(goal)} disabled={Object.keys(goal).length === 0}>
            Save & Next To Fill
          </Button>
        </GridInformation>
      </div>
    </Fragment>
  );
};

GoalViewer.propTypes = {
  goal: PropTypes.any,
  idx: PropTypes.number,
  onSave: PropTypes.func,
  setGoalIdx: PropTypes.func,
  setSecret: PropTypes.func,
  secret: PropTypes.any
};
