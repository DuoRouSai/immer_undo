import { connect } from 'react-redux'
import { increment, decrement, incrementByAsync } from "@/store/modules/countSlice";
import { setUser, removeUser, setAddress } from '@/store/modules/userSlice';
import { useSelector, useDispatch } from 'react-redux'
import { cloneDeep } from 'lodash'
import produce, { enablePatches, current, produceWithPatches, applyPatches } from 'immer'


function HomePage({ dispatch, count, user }) {
  return (
    <div>
      <div className='User'>
        <div>User撤销重做:
          <button onClick={() => dispatch({
            type: '@@User/UNDO'
          })}>撤销</button>
          <button onClick={() => dispatch({
            type: '@@User/REDO'
          })}>重做</button>
          <button onClick={() => dispatch({
            type: '@@User/CLEAR_HISTORY'
          })}>清空历史记录</button>
        </div>
        <div>{`日入斗金:${count}`}</div>
        <button
          aria-label="Increment value"
          onClick={() => dispatch(increment())}
        >
          Increment
        </button>
        <button
          aria-label="Decrement value"
          onClick={() => dispatch(decrement())}
        >
          Decrement
        </button>
        <button
          aria-label="AsyncIncrement value"
          onClick={() => dispatch(incrementByAsync(1))}
        >
          AsyncIncrement
        </button>
      </div>
      <div>
        <div>{`${JSON.stringify(user)}`}</div>
        <button
          onClick={() => dispatch(setUser())}
        >
          setUser
        </button>
        <button
          onClick={() => dispatch(removeUser())}
        >
          removeUser
        </button>
        <button
          onClick={() => dispatch(setAddress())}
        >
          setAddress
        </button>
      </div>
    </div>
  );
}

export default connect((state: any) => ({
  count: state.count.value,
  user: state.user
}))(HomePage);