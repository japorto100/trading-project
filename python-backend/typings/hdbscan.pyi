"""Minimal type stubs for hdbscan.

Only the members used in this codebase are stubbed.
Full API: https://hdbscan.readthedocs.io/en/latest/api.html
"""

from typing import Any
import numpy as np
from numpy.typing import ArrayLike

class HDBSCAN:
    labels_: np.ndarray
    probabilities_: np.ndarray

    def __init__(
        self,
        min_cluster_size: int = 5,
        min_samples: int | None = None,
        cluster_selection_epsilon: float = 0.0,
        max_cluster_size: int = 0,
        metric: str = "euclidean",
        alpha: float = 1.0,
        p: float | None = None,
        algorithm: str = "best",
        leaf_size: int = 40,
        approx_min_span_tree: bool = True,
        gen_min_span_tree: bool = False,
        core_dist_n_jobs: int = 4,
        cluster_selection_method: str = "eom",
        allow_single_cluster: bool = False,
        prediction_data: bool = False,
        **kwargs: Any,
    ) -> None: ...

    def fit(self, X: ArrayLike) -> "HDBSCAN": ...
    def fit_predict(self, X: ArrayLike) -> np.ndarray: ...
    def predict(self, points_to_predict: ArrayLike) -> tuple[np.ndarray, np.ndarray]: ...
