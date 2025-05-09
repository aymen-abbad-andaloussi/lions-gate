import { Text } from "react-native";

const TruncateText = ({ text, length }) => {
    if (!text || typeof text !== 'string') return null;

    const truncated = text.length > length ? text.slice(0, length) + '...' : text;

    return <Text>{truncated}</Text>;
};

export default TruncateText;
