import { useEffect, useState } from "react";

import * as tf from "@tensorflow/tfjs";
import { MobileNet } from "@tensorflow-models/mobilenet";
import * as mobilenet from "@tensorflow-models/mobilenet";

import {
  ChakraBaseProvider,
  Button,
  HStack,
  Image,
  extendTheme,
  Table,
  TableCaption,
  TableContainer,
  Tbody,
  Td,
  Th,
  Thead,
  Tr,
  Spinner,
  Flex,
  VStack,
} from "@chakra-ui/react";

const theme = extendTheme();

function App() {
  let [imageObject, setImageObjcet] = useState("");
  let [isClassifing, setIsClassifing] = useState(false);
  let [classifyResult, setClassifyResult] = useState<
    Array<{ className: string; probability: number }>
  >([]);

  useEffect(() => {
    (async () => {
      if (imageObject) {
        await tf.setBackend("webgl");
        const model: MobileNet = await mobilenet.load();

        let img_element = document.createElement("img");
        img_element.onload = async function () {
          const classifyPredictions: Array<{
            className: string;
            probability: number;
          }> = await model.classify(img_element);
          setClassifyResult(classifyPredictions);
          setIsClassifing(false);
        };
        img_element.src = imageObject;
      }
    })();
  }, [imageObject]);

  const handleCapture = function () {
    setIsClassifing(true);
    (chrome.tabs as any).captureVisibleTab(
      null,
      { format: "jpeg" },
      (base64Data: any) => {
        setImageObjcet(base64Data);
      }
    );
  };

  return (
    <ChakraBaseProvider theme={theme}>
      <div className="App">
        <HStack width="100%" justifyContent="center">
          <Button
            boxShadow="lg"
            margin="10px"
            color="white"
            bgColor="green.500"
            onClick={() => {
              handleCapture();
            }}
          >
            ScreenShot and Classify
          </Button>
        </HStack>

        {imageObject ? (
          <Flex width="100%" justifyContent="center">
            <Image
              borderRadius="5px"
              boxShadow="base"
              src={imageObject}
              width="90%"
              height="300px"
              objectFit="cover"
            ></Image>
          </Flex>
        ) : null}

        <Flex width="100%" justifyContent="center">
          {isClassifing ? (
            <VStack margin="10px">
              <Flex>Classifing</Flex>
              <Spinner />
            </VStack>
          ) : imageObject ? (
            <TableContainer
              width="90%"
              margin="10px"
              borderRadius="3px"
              boxShadow="base"
            >
              <Table variant="striped" colorScheme="teal">
                <TableCaption>MobileNet Classify Result</TableCaption>
                <Thead>
                  <Tr>
                    <Th>Classs</Th>
                    <Th isNumeric>Probability</Th>
                  </Tr>
                </Thead>
                <Tbody>
                  {classifyResult.map((result, _index) => (
                    <Tr>
                      <Td>{result.className}</Td>
                      <Td isNumeric>{result.probability}</Td>
                    </Tr>
                  ))}
                </Tbody>
              </Table>
            </TableContainer>
          ) : null}
        </Flex>
      </div>
    </ChakraBaseProvider>
  );
}

export default App;
