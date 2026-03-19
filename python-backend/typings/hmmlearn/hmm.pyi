"""Minimal type stubs for hmmlearn.hmm.

Only the members used in this codebase are stubbed.
Full API: https://hmmlearn.readthedocs.io/en/stable/api.html
"""

from typing import Any
import numpy as np
from numpy.typing import ArrayLike

class _BaseHMM:
    n_components: int
    startprob_: np.ndarray
    transmat_: np.ndarray

    def fit(self, X: ArrayLike, lengths: list[int] | None = None) -> "_BaseHMM": ...
    def predict(self, X: ArrayLike, lengths: list[int] | None = None) -> np.ndarray: ...
    def predict_proba(self, X: ArrayLike, lengths: list[int] | None = None) -> np.ndarray: ...
    def score(self, X: ArrayLike, lengths: list[int] | None = None) -> float: ...
    def decode(
        self,
        X: ArrayLike,
        lengths: list[int] | None = None,
        algorithm: str | None = None,
    ) -> tuple[float, np.ndarray]: ...
    def sample(
        self, n_samples: int = 1, random_state: int | None = None, currstate: int | None = None
    ) -> tuple[np.ndarray, np.ndarray]: ...


class GaussianHMM(_BaseHMM):
    means_: np.ndarray
    covars_: np.ndarray

    def __init__(
        self,
        n_components: int = 1,
        covariance_type: str = "diag",
        min_covar: float = 0.001,
        startprob_prior: float = 1.0,
        transmat_prior: float = 1.0,
        means_prior: float = 0,
        means_weight: float = 0,
        covars_prior: float = 0.01,
        covars_weight: float = 1,
        algorithm: str = "viterbi",
        random_state: int | None = None,
        n_iter: int = 10,
        tol: float = 0.01,
        verbose: bool = False,
        params: str = "stmc",
        init_params: str = "stmc",
        implementation: str = "log",
    ) -> None: ...


class MultinomialHMM(_BaseHMM):
    emissionprob_: np.ndarray

    def __init__(
        self,
        n_components: int = 1,
        startprob_prior: float = 1.0,
        transmat_prior: float = 1.0,
        algorithm: str = "viterbi",
        random_state: int | None = None,
        n_iter: int = 10,
        tol: float = 0.01,
        verbose: bool = False,
        params: str = "ste",
        init_params: str = "ste",
        **kwargs: Any,
    ) -> None: ...


class GMMHMM(_BaseHMM):
    def __init__(
        self,
        n_components: int = 1,
        n_mix: int = 1,
        covariance_type: str = "diag",
        algorithm: str = "viterbi",
        random_state: int | None = None,
        n_iter: int = 10,
        tol: float = 0.01,
        verbose: bool = False,
        params: str = "stmcw",
        init_params: str = "stmcw",
        **kwargs: Any,
    ) -> None: ...
