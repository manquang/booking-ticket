import axios from "axios";

import {
  ALL_RESERVATION_FAIL,
  ALL_RESERVATION_REQUEST,
  ALL_RESERVATION_SUCCESS,
  GET_SUMMARY_FAIL,
  GET_SUMMARY_REQUEST,
  GET_SUMMARY_SUCCESS,
  CREATE_RESERVATION_FAIL,
  CREATE_RESERVATION_REQUEST,
  CREATE_RESERVATION_SUCCESS,
  DELETE_RESERVATION_FAIL,
  DELETE_RESERVATION_REQUEST,
  DELETE_RESERVATION_SUCCESS,
  ONE_RESERVATION_FAIL,
  ONE_RESERVATION_REQUEST,
  ONE_RESERVATION_SUCCESS,
  UPDATE_RESERVATION_FAIL,
  UPDATE_RESERVATION_REQUEST,
  UPDATE_RESERVATION_SUCCESS,
} from "../constants/reservationConstants";
const baseURL = "http://localhost:5000";
//const baseURL = 'http://localhost:5000'
export const createReservation =
  (tickerPayment, paymentId) => async (dispatch) => {
    const reservation = { ...tickerPayment, paymentId: paymentId };
    try {
      dispatch({ type: CREATE_RESERVATION_REQUEST });
      const config = {
        headers: {
          "Content-Type": "application/json",
          Authorization: localStorage.getItem("token-user"),
        },
      };
      const { data } = await axios.post(
        `${baseURL}/api/v1/reservations`,
        reservation,
        config
      );
      dispatch({
        type: CREATE_RESERVATION_SUCCESS,
        payload: data,
      });
    } catch (error) {
      dispatch({
        type: CREATE_RESERVATION_FAIL,
        payload: error.response.data.message,
      });
    }
  };

export const getAllReservation = () => async (dispatch) => {
  try {
    dispatch({ type: ALL_RESERVATION_REQUEST });
    const { data } = await axios.get(`${baseURL}/api/v1/reservations`);
    dispatch({
      type: ALL_RESERVATION_SUCCESS,
      payload: data,
    });
  } catch (error) {
    dispatch({
      type: ALL_RESERVATION_FAIL,
      payload: error,
    });
  }
};

export const getOneReservation = (id) => async (dispatch) => {
  try {
    dispatch({ type: ONE_RESERVATION_REQUEST });
    const { data } = await axios.get(`${baseURL}/api/v1/reservations/${id}`);
    dispatch({
      type: ONE_RESERVATION_SUCCESS,
      payload: data,
    });
  } catch (error) {
    dispatch({
      type: ONE_RESERVATION_FAIL,
      payload: error,
    });
  }
};

export const deleteTicket = (id, paymentId) => async (dispatch) => {
  try {
    dispatch({ type: DELETE_RESERVATION_REQUEST });
    console.log("???" + paymentId);
    const { status } = await axios.post(`${baseURL}/api/v1/payment/refund`, {
      paymentId: paymentId,
    });
    const { data } = await axios.delete(`${baseURL}/api/v1/reservations/${id}`);
    dispatch({
      type: DELETE_RESERVATION_SUCCESS,
      payload: data,
    });
  } catch (error) {
    dispatch({
      type: DELETE_RESERVATION_FAIL,
      payload: error,
    });
  }
};

export const updateOneReservation = (id, values) => async (dispatch) => {
  try {
    dispatch({ type: UPDATE_RESERVATION_REQUEST });
    const config = { headers: { "Content-Type": "application/json" } };
    const { data } = await axios.put(
      `${baseURL}/api/v1/reservations/${id}`,
      values,
      config
    );
    dispatch({
      type: UPDATE_RESERVATION_SUCCESS,
      payload: data,
    });
  } catch (error) {
    dispatch({
      type: UPDATE_RESERVATION_FAIL,
      payload: error.response.data.message,
    });
  }
};

export const getSummaryReservation = () => async (dispatch) => {
  try {
    dispatch({ type: GET_SUMMARY_REQUEST });
    const { data } = await axios.get(`${baseURL}/api/v1/reservations/summary`);
    dispatch({
      type: GET_SUMMARY_SUCCESS,
      payload: data,
    });
  } catch (error) {
    dispatch({
      type: GET_SUMMARY_FAIL,
      payload: error.response.data.message,
    });
  }
};
