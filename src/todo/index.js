import { connect } from 'react-redux';
import Index from './components/App';

const mapStateToProps = (state) => {
  return { ...state.todo };
};

export default connect(mapStateToProps)(Index);
