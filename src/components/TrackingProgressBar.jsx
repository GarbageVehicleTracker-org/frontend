import React, { useState } from 'react';
import styled from 'styled-components';
import Modal from 'react-modal'; 

const ProgressBarContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  margin-top: 20px;
`;

const Circle = styled.div`
  width: ${props => props.size || 40}px; /* Dynamic width */
  height: ${props => props.size || 40}px; /* Dynamic height */
  border-radius: 50%;
  background-color: ${props => (props.isVisited ? 'green' : 'gray')};
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: ${props => (props.size ? props.size / 3 : 14)}px; /* Adjust font size dynamically */
  position: relative;
  cursor: pointer;
`;

const Line = styled.div`
  width: 60px; /* Fixed width */
  height: 4px;
  background-color: ${props => (props.isVisited ? 'green' : 'gray')};
  margin: 0 10px; /* Adjusted margin for better spacing */
  position: relative;
`;

const TimeLabel = styled.span`
  position: absolute;
  top: ${props => props.size ? props.size + 5 : 45}px; /* Adjust dynamically based on circle size */
  font-size: 10px;
  color: black;
`;

const ModalContent = styled.div`
  background: white;
  padding: 20px;
  border-radius: 10px;
  width: 300px;
  max-width: 90%;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
`;

const CloseButton = styled.button`
  margin-top: 10px;
  padding: 5px 10px;
  background-color: #007bff;
  color: white;
  border: none;
  border-radius: 5px;
  cursor: pointer;
`;

const formatTime = (timestamp) => {
  if (!timestamp) return '';
  const date = new Date(timestamp);
  if (isNaN(date.getTime())) return 'Invalid date';
  return date.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: 'numeric',
    hour12: true
  });
};

const TrackingProgressBar = ({ areaData, points, circleSize = 40, firstMatchCoordinates, lastMatchCoordinates }) => {
  const [modalIsOpen, setModalIsOpen] = useState(false);
  const [selectedPoint, setSelectedPoint] = useState(null);

  const openModal = (point) => {
    setSelectedPoint(point);
    setModalIsOpen(true);
  };

  const closeModal = () => {
    setModalIsOpen(false);
    setSelectedPoint(null);
  };

  return (
    <ProgressBarContainer>
      {points.map((point, index) => (
        <React.Fragment key={index}>
          <Circle
            size={circleSize}
            isVisited={point.isVisited || (index === 0 && firstMatchCoordinates) || (index === points.length - 1 && lastMatchCoordinates)}
            onClick={() => openModal(point)}
          >
            {index + 1}
            {(point.isVisited || (index === 0 && firstMatchCoordinates) || (index === points.length - 1 && lastMatchCoordinates)) && <TimeLabel size={circleSize}>{formatTime(point.visitedTimestamp)}</TimeLabel>}
          </Circle>
          {index < points.length - 1 && (
            <Line isVisited={points[index].isVisited && points[index + 1].isVisited} />
          )}
        </React.Fragment>
      ))}

      <Modal
        isOpen={modalIsOpen}
        onRequestClose={closeModal}
        contentLabel="Dustbin Details"
        ariaHideApp={false}
        style={{
          content: {
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            inset: '50% auto auto 50%',
            transform: 'translate(-50%, -50%)',
            zIndex: 1001, // Higher z-index
          },
          overlay: {
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            zIndex: 1000, // Ensuring overlay is behind content
          }
        }}
      >
        {selectedPoint && (
          <ModalContent>
            <h2>Dustbin Details</h2>
            <p><strong>Time of Arrival:</strong> {formatTime(selectedPoint.visitedTimestamp)}</p>
            <p><strong>Area Name:</strong> {areaData.name}</p>
            <p><strong>Dustbin No:</strong> {selectedPoint.dustbinNumber}</p>
            <CloseButton onClick={closeModal}>Close</CloseButton>
          </ModalContent>
        )}
      </Modal>
    </ProgressBarContainer>
  );
};

export default TrackingProgressBar;
